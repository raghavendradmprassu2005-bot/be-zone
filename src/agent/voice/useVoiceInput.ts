import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  requestMicrophonePermission,
  type BrowserSpeechRecognition,
} from "@/agent/voice/speechRecognition";

export type VoiceState =
  | "permission_required"
  | "requesting_permission"
  | "activating"
  | "listening"
  | "processing"
  | "speaking"
  | "paused"
  | "denied"
  | "unsupported"
  | "error";

interface UseVoiceInputOptions {
  onTranscript: (transcript: string) => void;
}

const ONBOARDED_KEY = "be-zone-agent-voice-onboarded";

const hasCompletedOnboarding = (): boolean => {
  try {
    return sessionStorage.getItem(ONBOARDED_KEY) === "true";
  } catch {
    return false;
  }
};

const markOnboardingComplete = (): void => {
  try {
    sessionStorage.setItem(ONBOARDED_KEY, "true");
  } catch {
    // Voice remains available when session storage is unavailable.
  }
};

export const useVoiceInput = ({ onTranscript }: UseVoiceInputOptions) => {
  const [state, setState] = useState<VoiceState>(() =>
    hasCompletedOnboarding() ? "paused" : "permission_required",
  );
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const processingRef = useRef(false);
  const speakingRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const startRecognitionRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const stopRecognition = useCallback(() => {
    clearRestartTimer();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    recognition?.stop();
  }, [clearRestartTimer]);

  const scheduleRestart = useCallback(() => {
    if (
      !activeRef.current ||
      processingRef.current ||
      speakingRef.current ||
      restartTimerRef.current !== null
    ) {
      return;
    }

    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = null;
      if (!activeRef.current || processingRef.current || speakingRef.current) return;
      setState("activating");
      startRecognitionRef.current();
    }, 350);
  }, []);

  const startRecognition = useCallback(() => {
    if (!activeRef.current || processingRef.current || speakingRef.current) return;

    const recognition = createSpeechRecognition();
    if (!recognition) {
      activeRef.current = false;
      setIsActive(false);
      setState("unsupported");
      setErrorMessage("Voice isn't available in this browser. You can continue with text.");
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    recognition.onstart = () => setState("listening");
    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalTranscript += result[0]?.transcript ?? "";
        else interimTranscript += result[0]?.transcript ?? "";
      }

      const nextTranscript = (finalTranscript || interimTranscript).trim();
      if (nextTranscript) setTranscript(nextTranscript);

      const normalizedFinal = finalTranscript.trim();
      if (!normalizedFinal || normalizedFinal === lastTranscriptRef.current) return;
      lastTranscriptRef.current = normalizedFinal;
      processingRef.current = true;
      setState("processing");
      recognition.stop();
      onTranscriptRef.current(normalizedFinal);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        activeRef.current = false;
        setIsActive(false);
        setState("denied");
        setErrorMessage("Voice isn't available right now. You can continue with text.");
        return;
      }
      if (activeRef.current && !processingRef.current && !speakingRef.current) {
        setState("error");
        setErrorMessage("I couldn't hear that clearly. I'll keep trying, or you can type instead.");
      }
    };
    recognition.onend = () => {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      if (activeRef.current && !processingRef.current && !speakingRef.current) {
        scheduleRestart();
      }
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      if (activeRef.current) scheduleRestart();
    }
  }, [scheduleRestart]);
  startRecognitionRef.current = startRecognition;

  const enableVoice = useCallback(async () => {
    markOnboardingComplete();
    if (!isSpeechRecognitionSupported()) {
      setState("unsupported");
      setErrorMessage("Voice isn't available in this browser. You can continue with text.");
      return false;
    }

    setState("requesting_permission");
    setErrorMessage("");
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        setState("denied");
        setErrorMessage("Voice isn't available right now. You can continue with text.");
        return false;
      }
      activeRef.current = true;
      setIsActive(true);
      processingRef.current = false;
      speakingRef.current = false;
      setState("activating");
      startRecognition();
      return true;
    } catch {
      setState("denied");
      setErrorMessage("Voice isn't available right now. You can continue with text.");
      return false;
    }
  }, [startRecognition]);

  const disableVoice = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    processingRef.current = false;
    speakingRef.current = false;
    stopRecognition();
    setState("paused");
    setTranscript("");
  }, [stopRecognition]);

  const beginProcessing = useCallback(() => {
    if (!activeRef.current) return;
    processingRef.current = true;
    stopRecognition();
    setState("processing");
  }, [stopRecognition]);

  const beginSpeaking = useCallback(() => {
    if (!activeRef.current) return;
    processingRef.current = false;
    speakingRef.current = true;
    stopRecognition();
    setState("speaking");
  }, [stopRecognition]);

  const resumeListening = useCallback(() => {
    if (!activeRef.current) return;
    speakingRef.current = false;
    processingRef.current = false;
    lastTranscriptRef.current = "";
    setTranscript("");
    setState("activating");
    startRecognition();
  }, [startRecognition]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      setIsActive(false);
      stopRecognition();
    };
  }, [stopRecognition]);

  return {
    state,
    transcript,
    errorMessage,
    isSupported: isSpeechRecognitionSupported(),
    isActive,
    enableVoice,
    disableVoice,
    beginProcessing,
    beginSpeaking,
    resumeListening,
  };
};
