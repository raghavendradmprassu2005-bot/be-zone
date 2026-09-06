import { describe, expect, it } from "vitest";
import { detectLanguage } from "@/agent/core/languageDetector";
import { detectIntent } from "@/agent/core/intentDetector";
import { parseQuery } from "@/agent/core/queryParser";
import { determineClarification } from "@/agent/core/clarificationEngine";
import { updateConversationContext } from "@/agent/core/conversationContext";
import { createAgentOrchestrator } from "@/agent/core/agentOrchestrator";
import type { AgentContext, AgentMessage } from "@/agent/types";
import type { Product } from "@/lib/types";

const context = (): AgentContext => ({
  detectedLanguage: "auto",
  currentIntent: "unknown",
  isAuthenticated: false,
});

const message = (content: string): AgentMessage => ({
  id: "message-1",
  role: "user",
  content,
  createdAt: "2026-01-01T00:00:00.000Z",
});

describe("B Agent language detection", () => {
  it("detects English, Kannada, and Kanglish", () => {
    expect(detectLanguage("Show me a face wash")).toBe("english");
    expect(detectLanguage("ನನಗೆ face wash ಬೇಕು")).toBe("kannada");
    expect(detectLanguage("Nanage face wash beku")).toBe("kanglish");
  });
});

describe("B Agent intent and query parsing", () => {
  it("detects shopping intents", () => {
    expect(detectIntent("Find face wash").intent).toBe("product_search");
    expect(detectIntent("Suggest something for oily skin").intent).toBe(
      "product_recommendation",
    );
    expect(detectIntent("What is this product?").intent).toBe("product_information");
    expect(detectIntent("Compare these two").intent).toBe("product_comparison");
  });

  it("extracts category, concern, and budget conservatively", () => {
    expect(parseQuery("face wash under 500")).toMatchObject({
      category: "face wash",
      maxPrice: 500,
    });
    expect(parseQuery("oily skin ge moisturizer beku 1000 olage")).toMatchObject({
      category: "moisturizer",
      skinType: "oily skin",
      maxPrice: 1000,
    });
  });

  it("parses natural budget and broad product concepts", () => {
    expect(parseQuery("Show me moisturizers under ₹1000")).toMatchObject({
      category: "moisturizer",
      query: "moisturizer",
      maxPrice: 1000,
    });
    expect(parseQuery("find glow product")).toMatchObject({
      query: "glow",
    });
    expect(parseQuery("₹1000 olage moisturizer torisu")).toMatchObject({
      category: "moisturizer",
      maxPrice: 1000,
    });
    expect(detectIntent("find glow product").intent).toBe("product_search");
    expect(detectIntent("idu cart ge add madu").intent).toBe("cart_action");
    expect(detectIntent("checkout madu").intent).toBe("navigation");
  });
});

describe("B Agent context and clarification", () => {
  it("asks for a category for an underspecified recommendation", () => {
    const current = { ...context(), currentIntent: "product_recommendation" as const };
    expect(determineClarification("product_recommendation", current)).toMatchObject({
      needsClarification: true,
      missingInformation: ["category"],
    });
  });

  it("keeps oily skin context for a later face wash request", () => {
    const first = updateConversationContext(
      context(),
      message("I have oily skin"),
      "english",
      detectIntent("I have oily skin"),
    );
    const second = updateConversationContext(
      first,
      message("Suggest a face wash"),
      "english",
      detectIntent("Suggest a face wash"),
    );

    expect(second).toMatchObject({ skinType: "oily skin", category: "face wash" });
  });
});

describe("B Agent orchestration", () => {
  it("returns only products supplied by the product service", async () => {
    const product: Product = {
      id: "real-product",
      name: "Verified Face Wash",
      description: "A product returned by the test product service.",
      price: 299,
      category: "beauty-care",
      image: "",
      rating: 4,
      reviewCount: 2,
      tags: ["face wash"],
      inStock: true,
    };
    const queries: string[] = [];
    const orchestrator = createAgentOrchestrator({
      productService: {
        search: async (query) => {
          queries.push(query.searchTerm ?? "");
          return [product];
        },
        getById: async () => product,
      },
    });

    const result = await orchestrator.processAgentMessage(
      message("Find face wash under 500"),
      context(),
    );

    expect(result.type).toBe("product_results");
    expect(result.products).toEqual([product]);
    expect(queries).toEqual(["face wash"]);
  });

  it("passes broad concepts and budget constraints to the product service", async () => {
    const queries: Array<{ searchTerm?: string; maxPrice?: number }> = [];
    const orchestrator = createAgentOrchestrator({
      productService: {
        search: async (query) => {
          queries.push({ searchTerm: query.searchTerm, maxPrice: query.maxPrice });
          return [];
        },
        getById: async () => null,
      },
    });

    const result = await orchestrator.processAgentMessage(
      message("find glow product"),
      context(),
    );

    expect(result.type).toBe("product_results");
    expect(queries).toEqual([{ searchTerm: "glow", maxPrice: undefined }]);
  });

  it("resolves a confirmation to add the only shown verified product", async () => {
    const product: Product = {
      id: "real-product",
      name: "Verified Face Wash",
      description: "A product returned by the test product service.",
      price: 299,
      category: "beauty-care",
      image: "",
      rating: 4,
      reviewCount: 2,
      tags: ["face wash"],
      inStock: true,
    };
    const orchestrator = createAgentOrchestrator({
      productService: {
        search: async () => [product],
        getById: async (id) => (id === product.id ? product : null),
      },
    });
    const shown = await orchestrator.processAgentMessage(
      message("Nanige Verified Face Wash order madu"),
      context(),
    );
    const confirmed = await orchestrator.processAgentMessage(
      message("haudu"),
      shown.context,
    );

    expect(shown.context.pendingShoppingAction).toBe("confirm_add_to_cart");
    expect(confirmed.shoppingAction).toBe("ADD_TO_CART");
    expect(confirmed.products).toEqual([product]);

    const checkout = await orchestrator.processAgentMessage(
      message("yes"),
      confirmed.context,
    );
    expect(checkout.shoppingAction).toBe("NAVIGATE_TO_CHECKOUT");
  });
});
