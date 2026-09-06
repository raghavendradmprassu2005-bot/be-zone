import "@supabase/functions-js/edge-runtime.d.ts";
import type {
  AgentAIProvider,
  AgentAIRequest,
} from "./providers/types.ts";
import { GeminiProvider } from "./providers/geminiProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_PRODUCTS = 20;
const MAX_PRODUCT_TEXT_LENGTH = 2_000;

const response = (body: Record<string, unknown>, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const validateRequest = (body: unknown): AgentAIRequest | null => {
  if (!isRecord(body)) return null;
  if (typeof body.userMessage !== "string" || body.userMessage.length > MAX_MESSAGE_LENGTH) {
    return null;
  }
  if (!["kannada", "english", "kanglish", "unknown"].includes(String(body.language))) {
    return null;
  }
  if (typeof body.intent !== "string" || !isRecord(body.context) || !isRecord(body.result)) {
    return null;
  }

  const result = body.result;
  if (
    typeof result.type !== "string" ||
    !Array.isArray(result.products) ||
    result.products.length > MAX_PRODUCTS
  ) {
    return null;
  }

  const products = result.products.filter(isRecord).map((product) => ({
    id: typeof product.id === "string" ? product.id : "",
    name: typeof product.name === "string" ? product.name.slice(0, MAX_PRODUCT_TEXT_LENGTH) : "",
    price: product.price,
    category: typeof product.category === "string" ? product.category : "",
    description:
      typeof product.description === "string"
        ? product.description.slice(0, MAX_PRODUCT_TEXT_LENGTH)
        : "",
    inStock: product.inStock,
    tags: Array.isArray(product.tags) ? product.tags.slice(0, 20) : [],
  }));

  return {
    userMessage: body.userMessage,
    language: body.language as AgentAIRequest["language"],
    intent: body.intent,
    context: body.context,
    result: {
      type: result.type,
      language: typeof result.language === "string" ? result.language : "",
      intent: typeof result.intent === "string" ? result.intent : "",
      products,
      clarification: isRecord(result.clarification) ? result.clarification : null,
    },
  };
};

const createProvider = (): AgentAIProvider => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("AI provider is not configured.");
  }
  return new GeminiProvider(apiKey);
};

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
    if (req.method !== "POST") return response({ error: "Method not allowed" }, 405);

    try {
      const input = validateRequest(await req.json());
      if (!input) return response({ error: "Invalid agent request." }, 400);

      const provider = createProvider();
      const result = await provider.generateResponse(input);
      return response({ message: result.message });
    } catch {
      return response({ error: "AI response generation failed." }, 503);
    }
  },
};
