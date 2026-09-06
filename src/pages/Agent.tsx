import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { agentOrchestrator } from "@/agent/core/agentOrchestrator";
import { agentService } from "@/agent/services/agentService";
import { useVoiceInput, type VoiceState } from "@/agent/voice/useVoiceInput";
import type { AgentAIRequest, AgentContext, AgentMessage, AgentResult } from "@/agent/types";
import AgentMessageBubble from "@/components/agent/AgentMessageBubble";
import AgentThinking from "@/components/agent/AgentThinking";

interface ConversationEntry {
  id: string;
  role: "user" | "assistant";
  content: string;
  result?: AgentResult;
}

const SUGGESTIONS = [
  "Show me moisturizers under ₹1000",
  "Something under ₹1000",
  "Help me choose a cleanser",
];

const createMessage = (content: string): AgentMessage => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role: "user",
  content,
  createdAt: new Date().toISOString(),
});

const initialContext = (isAuthenticated: boolean): AgentContext => ({
  detectedLanguage: "auto",
  currentIntent: "unknown",
  isAuthenticated,
  currentPage: "/agent",
});

const toAIRequest = (message: AgentMessage, result: AgentResult): AgentAIRequest => ({
  userMessage: message.content,
  language: result.language,
  intent: result.intent,
  context: {
    category: result.context.category,
    query: result.context.query,
    budget: result.context.budget,
    minPrice: result.context.minPrice,
    maxPrice: result.context.maxPrice,
    concern: result.context.concern,
    skinType: result.context.skinType,
    brand: result.context.brand,
    selectedProductIds: result.context.selectedProductIds,
    lastSearchQuery: result.context.lastSearchQuery,
    lastShownProductIds: result.context.lastShownProductIds,
    pendingShoppingAction: result.context.pendingShoppingAction,
  },
  result,
});

const isUsableResult = (result: AgentResult): boolean =>
  Boolean(result && typeof result.type === "string" && typeof result.language === "string" && Array.isArray(result.products) && result.context);

const stateLabel = (state: VoiceState): string => {
  switch (state) {
    case "requesting_permission":
      return "Activating voice";
    case "activating":
      return "Starting voice";
    case "listening":
      return "Listening";
    case "processing":
      return "B is thinking";
    case "speaking":
      return "B is speaking";
    case "denied":
    case "unsupported":
    case "error":
      return "Voice unavailable";
    default:
      return "Voice paused";
  }
};

const Agent = () => {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [context, setContext] = useState<AgentContext>(() => initialContext(Boolean(user)));
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState("");
  const [sessionState, setSessionState] = useState<
    "GREETING" | "IDLE" | "THINKING" | "SHOWING_PRODUCT" | "ADDING_TO_CART" | "CHECKOUT" | "ERROR"
  >("GREETING");
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<(event?: FormEvent, suggestion?: string) => Promise<void>>();
  const voiceRef = useRef<ReturnType<typeof useVoiceInput> | null>(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const submitMessage = useCallback(async (event?: FormEvent, suggestion?: string) => {
    event?.preventDefault();
    const content = (suggestion ?? input).trim();
    if (!content || isThinking) return;

    voiceRef.current?.beginProcessing();
    setSessionState("THINKING");
    const message = createMessage(content);
    setInput("");
    setEntries((current) => [...current, { id: message.id, role: "user", content }]);
    setIsThinking(true);

    try {
      const result = await agentOrchestrator.processAgentMessage(message, context);
      if (!isUsableResult(result)) throw new Error("The Agent returned an invalid result.");
      setContext(result.context);
      let responseMessage: string;
      if (result.shoppingAction === "ADD_TO_CART" && result.products[0]) {
        setSessionState("ADDING_TO_CART");
        try {
          addItem(result.products[0], false);
          responseMessage = "Done. I've added it to your cart. Would you like to continue to checkout?";
        } catch {
          setSessionState("ERROR");
          responseMessage = "I couldn't add that to your cart right now. Please try again.";
        }
      } else if (result.shoppingAction === "NAVIGATE_TO_CHECKOUT") {
        setSessionState("CHECKOUT");
        responseMessage = "Great. Let's continue to secure checkout.";
      } else {
        const response = await agentService.generateResponse(toAIRequest(message, result));
        responseMessage = response.message;
        if (result.type === "product_results") setSessionState("SHOWING_PRODUCT");
      }
      setEntries((current) => [
        ...current,
        { id: `${message.id}-response`, role: "assistant", content: responseMessage, result },
      ]);

      if (result.shoppingAction === "NAVIGATE_TO_CHECKOUT") {
        window.setTimeout(() => navigate("/checkout"), 350);
      }

      const synthesis = typeof window !== "undefined" ? window.speechSynthesis : undefined;
      if (speechEnabled && synthesis) {
        voiceRef.current?.beginSpeaking();
        synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          responseMessage.length > 240 ? `${responseMessage.slice(0, 237)}...` : responseMessage,
        );
        utterance.onend = () => voiceRef.current?.resumeListening();
        utterance.onerror = () => voiceRef.current?.resumeListening();
        synthesis.speak(utterance);
      } else {
        voiceRef.current?.resumeListening();
      }
    } catch {
      setSessionState("ERROR");
      setEntries((current) => [
        ...current,
        { id: `${message.id}-error`, role: "assistant", content: "I’m having a little trouble right now. Please try again." },
      ]);
      voiceRef.current?.resumeListening();
    } finally {
      setIsThinking(false);
    }
  }, [addItem, context, input, isThinking, navigate, speechEnabled]);

  submitRef.current = submitMessage;
  const voice = useVoiceInput({
    onTranscript: (transcript) => void submitRef.current?.(undefined, transcript),
  });
  voiceRef.current = voice;

  useEffect(() => {
    setContext((current) => ({ ...current, isAuthenticated: Boolean(user) }));
  }, [user]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 180;
    if (nearBottom && typeof endRef.current?.scrollIntoView === "function") {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [entries, isThinking]);

  const canSubmit = useMemo(() => input.trim().length > 0 && !isThinking, [input, isThinking]);
  const showPermission = voice.state === "permission_required";
  const showWelcome = entries.length === 0;
  const showLiveVoice = voice.isActive && !showPermission;

  const handleEnableVoice = async () => {
    const enabled = await voice.enableVoice();
    if (!enabled) setVoiceNotice(voice.errorMessage);
  };

  const handleDisableVoice = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    voice.disableVoice();
  };

  return (
    <main
      data-agent-state={sessionState}
      className="min-h-screen overflow-hidden bg-[#080807] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-[#f7f1e8] sm:px-8 sm:pb-6"
    >
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col bg-[#0d0d0c]">
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5 sm:px-12">
          <div>
            <p className="font-display text-2xl tracking-wide text-[#f4f0e8]">B</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#777169]">Be-Zone personal beauty space</p>
          </div>
          <div className="flex items-center gap-3">
            {showLiveVoice && (
              <button
                type="button"
                onClick={handleDisableVoice}
                aria-label="Disable continuous voice mode"
                className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#a9a29a] transition-colors hover:text-[#e3c07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#e3c07a]" />
                Voice active
              </button>
            )}
            <button
              type="button"
              onClick={() => setSpeechEnabled((current) => !current)}
              aria-label={speechEnabled ? "Mute B Agent voice" : "Enable B Agent voice"}
              aria-pressed={speechEnabled}
              className="rounded-full p-2 text-[#8d867d] transition-colors hover:text-[#e3c07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
            >
              {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-5 py-8 sm:px-12 sm:py-12" aria-live="polite">
          {showWelcome ? (
            <div className="mx-auto flex min-h-[34rem] max-w-3xl flex-col items-center justify-start pt-12 text-center sm:pt-16">
              <motion.div
                animate={reducedMotion ? undefined : { opacity: [0.82, 1, 0.82], scale: [1, 1.015, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex h-32 w-32 items-center justify-center rounded-full border border-[#c4921a]/50 text-[#f4f0e8] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03),0_0_45px_rgba(196,146,26,0.08)] sm:h-40 sm:w-40"
                aria-label="B Agent"
              >
                <span className="font-display text-7xl leading-none sm:text-8xl">B</span>
              </motion.div>
              <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-[#a98b55]">Be-Zone / B</p>
              <p className="mt-3 text-sm text-[#d9d0c5]">
                Hello{user?.user_metadata?.full_name
                  ? `, ${String(user.user_metadata.full_name).split(" ")[0]}`
                  : ""} 👋
              </p>
              <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight tracking-tight text-[#f7f1e8] sm:text-5xl">
                What can I help you find?
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#a9a29a]">
                Your personal Be-Zone beauty assistant. Speak naturally, or continue with text.
              </p>

              {showPermission ? (
                <div className="mt-9 text-center">
                  <p className="text-xs text-[#8d867d]">B uses your microphone so you can talk naturally.</p>
                  <button
                    type="button"
                    onClick={() => void handleEnableVoice()}
                    className="mt-4 inline-flex items-center gap-2 border-b border-[#e3c07a] pb-1 text-sm text-[#e3c07a] transition-colors hover:text-[#f7f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
                  >
                    <Mic className="h-4 w-4" />
                    Enable microphone
                  </button>
                  <button
                    type="button"
                    onClick={voice.disableVoice}
                    className="ml-5 text-sm text-[#8d867d] transition-colors hover:text-[#f7f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
                  >
                    Continue with text
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-center" role="status" aria-live="polite">
                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#a9a29a]">
                    {voice.state === "listening" ? <Mic className="h-3.5 w-3.5 text-[#e3c07a]" /> : <MicOff className="h-3.5 w-3.5 text-[#777169]" />}
                    {stateLabel(voice.state)}
                  </div>
                  {voice.transcript && voice.state === "listening" && (
                    <p className="mt-4 max-w-md text-sm italic text-[#d9d0c5]">&ldquo;{voice.transcript}&rdquo;</p>
                  )}
                  {(voice.errorMessage || voiceNotice) && <p className="mt-3 text-xs text-[#c9a6a0]">{voice.errorMessage || voiceNotice}</p>}
                </div>
              )}

              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-[#777169]">
                <span className="uppercase tracking-[0.18em]">Try asking</span>
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void submitMessage(undefined, suggestion)}
                    className="border-b border-white/[0.12] pb-1 text-[#b9b0a5] transition-colors hover:border-[#c4921a] hover:text-[#f7f1e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-7">
              {entries.map((entry) => (
                <AgentMessageBubble key={entry.id} content={entry.content} role={entry.role} result={entry.result} />
              ))}
              {isThinking && <AgentThinking />}
              {voice.isActive && voice.transcript && voice.state === "listening" && (
                <p className="text-center text-sm italic text-[#a9a29a]" aria-live="polite">&ldquo;{voice.transcript}&rdquo;</p>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(event) => void submitMessage(event)} className="border-t border-white/[0.07] bg-[#0c0c0b] px-4 py-4 sm:px-10">
          <div className="mx-auto flex max-w-3xl items-end gap-3 border-b border-white/[0.16] pb-2 focus-within:border-[#c4921a]">
            {voice.isActive ? (
              <button
                type="button"
                onClick={handleDisableVoice}
                aria-label="Disable continuous voice mode"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-[#e3c07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
              >
                <Mic className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleEnableVoice()}
                aria-label="Enable continuous voice mode"
                className="flex h-9 w-9 shrink-0 items-center justify-center text-[#777169] hover:text-[#e3c07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a]"
              >
                <MicOff className="h-4 w-4" />
              </button>
            )}
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitMessage();
                }
              }}
              placeholder="Ask B Agent anything..."
              aria-label="Message B Agent"
              rows={1}
              disabled={isThinking}
              className="max-h-32 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-[#f7f1e8] outline-none placeholder:text-[#777169] disabled:opacity-60"
            />
            <button type="submit" disabled={!canSubmit} aria-label="Send message" className="flex h-9 w-9 shrink-0 items-center justify-center text-[#e3c07a] transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4921a] disabled:cursor-not-allowed disabled:opacity-25">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] uppercase tracking-[0.14em] text-[#5f5a54]">Verified Be-Zone product information</p>
        </form>
      </section>
    </main>
  );
};

export default Agent;
