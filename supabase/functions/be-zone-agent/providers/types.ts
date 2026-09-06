export interface AgentAIRequest {
  userMessage: string;
  language: "kannada" | "english" | "kanglish" | "unknown";
  intent: string;
  context: Record<string, unknown>;
  result: {
    type: string;
    language: string;
    intent: string;
    products: Array<Record<string, unknown>>;
    clarification: Record<string, unknown> | null;
  };
}

export interface AgentAIResponse {
  message: string;
}

export interface AgentAIProvider {
  generateResponse(input: AgentAIRequest): Promise<AgentAIResponse>;
}
