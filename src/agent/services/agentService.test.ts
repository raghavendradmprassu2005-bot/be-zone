import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  agentService,
  createUnavailableAgentService,
} from "@/agent/services/agentService";
import type { AgentAIRequest } from "@/agent/types";

const invoke = vi.hoisted(() => vi.fn());

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke },
  },
}));

const input = (): AgentAIRequest => ({
  userMessage: "Show me moisturizers under 1000",
  language: "english",
  intent: "product_search",
  context: {
    category: "moisturizer",
    query: "moisturizer",
    budget: 1000,
  },
  result: {
    type: "product_results",
    language: "english",
    intent: "product_search",
    message: null,
    products: [
      {
        id: "verified-product",
        name: "Verified Moisturizer",
        description: "Returned by the Be-Zone product service.",
        price: 499,
        category: "beauty-care",
        image: "",
        rating: 4,
        reviewCount: 1,
        tags: ["moisturizer"],
        inStock: true,
      },
    ],
    context: {
      detectedLanguage: "english",
      currentIntent: "product_search",
      isAuthenticated: false,
    },
    clarification: null,
  },
});

describe("Supabase agent service", () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it("returns a successful server-generated response", async () => {
    invoke.mockResolvedValue({
      data: { message: "Here are the verified Be-Zone options." },
      error: null,
    });

    await expect(agentService.generateResponse(input())).resolves.toEqual({
      message: "Here are the verified Be-Zone options.",
      usedFallback: false,
    });
    expect(invoke).toHaveBeenCalledWith("be-zone-agent", {
      body: input(),
    });
  });

  it("uses a safe fallback when the Edge Function fails", async () => {
    invoke.mockResolvedValue({ data: null, error: new Error("timeout") });

    await expect(agentService.generateResponse(input())).resolves.toMatchObject({
      usedFallback: true,
      message: expect.stringContaining("Be-Zone"),
    });
  });

  it("uses a safe fallback for malformed provider responses", async () => {
    invoke.mockResolvedValue({ data: { message: 42 }, error: null });

    await expect(agentService.generateResponse(input())).resolves.toMatchObject({
      usedFallback: true,
    });
  });

  it("falls back safely when no provider is configured", async () => {
    const unavailable = createUnavailableAgentService();
    const result = await unavailable.generateResponse(input());

    expect(result.usedFallback).toBe(true);
    expect(result.message).toContain("Be-Zone");
  });

  it("keeps fallback language aligned with Kannada and Kanglish requests", async () => {
    invoke.mockRejectedValue(new Error("provider timeout"));

    const kannada = await agentService.generateResponse({
      ...input(),
      language: "kannada",
    });
    const kanglish = await agentService.generateResponse({
      ...input(),
      language: "kanglish",
    });

    expect(kannada.usedFallback).toBe(true);
    expect(kannada.message).toContain("ನಿಮ್ಮ");
    expect(kanglish.message).toContain("Nimma");
  });

  it("does not expose product data or provider details in the fallback", async () => {
    invoke.mockRejectedValue(new Error("provider failure"));

    const result = await agentService.generateResponse(input());

    expect(result.usedFallback).toBe(true);
    expect(result.message).not.toContain("Verified Moisturizer");
    expect(result.message).not.toContain("verified-product");
    expect(result.message).not.toContain("API");
  });
});
