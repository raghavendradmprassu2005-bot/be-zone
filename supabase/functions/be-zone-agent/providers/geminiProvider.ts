import type {
  AgentAIProvider,
  AgentAIRequest,
  AgentAIResponse,
} from "./types.ts";
import { BE_ZONE_SYSTEM_INSTRUCTION, buildPrompt } from "./prompt.ts";

const DEFAULT_MODEL = "gemini-2.0-flash";
const REQUEST_TIMEOUT_MS = 12_000;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

export class GeminiProvider implements AgentAIProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model = Deno.env.get("GEMINI_MODEL") || DEFAULT_MODEL,
  ) {}

  async generateResponse(input: AgentAIRequest): Promise<AgentAIResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent` +
        `?key=${encodeURIComponent(this.apiKey)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: BE_ZONE_SYSTEM_INSTRUCTION }],
          },
          contents: [{ role: "user", parts: [{ text: buildPrompt(input) }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 180,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Gemini provider request failed.");
      }

      const payload = (await response.json()) as GeminiResponse;
      const message = payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim();

      if (!message) {
        throw new Error("Gemini provider returned no message.");
      }

      return { message };
    } finally {
      clearTimeout(timeout);
    }
  }
}
