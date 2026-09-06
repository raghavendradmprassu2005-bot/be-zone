import type { Product } from "@/lib/types";
import type {
  AgentContext,
  AgentMessage,
  AgentResult,
  AgentProductQuery,
  AgentShoppingAction,
} from "@/agent/types";
import { detectLanguage } from "@/agent/core/languageDetector";
import { detectIntent } from "@/agent/core/intentDetector";
import { determineClarification } from "@/agent/core/clarificationEngine";
import { updateConversationContext } from "@/agent/core/conversationContext";
import {
  supabaseAgentProductService,
  type AgentProductService,
} from "@/agent/services/productService";
import { createCompareProductsTool } from "@/agent/tools/compareProducts";
import { createGetProductTool } from "@/agent/tools/getProduct";
import { createSearchProductsTool } from "@/agent/tools/searchProducts";

export interface AgentOrchestratorOptions {
  productService?: AgentProductService;
}

const emptyResult = (
  type: AgentResult["type"],
  language: AgentResult["language"],
  intent: AgentResult["intent"],
  context: AgentContext,
  clarification: AgentResult["clarification"] = null,
  products: Product[] = [],
  shoppingAction?: AgentShoppingAction,
  actionProductId?: Product["id"],
): AgentResult => ({
  type,
  language,
  intent,
  message: null,
  products,
  context,
  clarification,
  shoppingAction,
  actionProductId,
});

const isAffirmative = (message: string): boolean =>
  /^(yes|yeah|yep|sure|okay|ok|haudu|howdu|ಹೌದು|adu|idu)$/i.test(message.trim());

const isNegative = (message: string): boolean =>
  /^(no|nope|beda|cancel|cancel madu|ಬೇಡ)$/i.test(message.trim());

const isPurchaseRequest = (message: string): boolean =>
  /\b(order|buy|purchase|cart ge add|add to cart|haki|hakki)\b/i.test(message);

const clarificationResult = (
  language: AgentResult["language"],
  intent: AgentResult["intent"],
  context: AgentContext,
  question: string,
): AgentResult => emptyResult("clarification", language, intent, context, {
  needsClarification: true,
  question,
  missingInformation: ["product"],
});

const rankProducts = (products: Product[], context: AgentContext): Product[] => {
  const terms = [context.category, context.query, context.concern, context.skinType]
    .filter((term): term is string => Boolean(term))
    .map((term) => term.toLowerCase());

  return products
    .map((product, index) => {
      const searchable = `${product.name} ${product.description} ${product.category} ${product.tags.join(" ")}`
        .toLowerCase();
      const relevance = terms.reduce(
        (score, term) => score + (searchable.includes(term) ? 1 : 0),
        0,
      );
      return { product, score: relevance, index };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ product }) => product);
};

const toProductQuery = (context: AgentContext): AgentProductQuery => ({
  searchTerm: context.query ?? context.category,
  searchTerms: context.query ? [context.query] : undefined,
  minPrice: context.minPrice,
  maxPrice: context.maxPrice ?? context.budget,
  inStockOnly: true,
  limit: 20,
});

export const createAgentOrchestrator = ({
  productService = supabaseAgentProductService,
}: AgentOrchestratorOptions = {}) => {
  const searchProducts = createSearchProductsTool(productService);
  const getProduct = createGetProductTool(productService);
  const compareProducts = createCompareProductsTool(productService);

  return {
    async processAgentMessage(
      message: AgentMessage,
      previousContext: AgentContext,
    ): Promise<AgentResult> {
      const language = detectLanguage(message.content);
      const detection = detectIntent(message.content);
      const context = updateConversationContext(
        previousContext,
        message,
        language,
        detection,
      );

      if (previousContext.pendingShoppingAction === "confirm_add_to_cart") {
        if (isAffirmative(message.content)) {
          const productIds = previousContext.lastShownProductIds ?? [];
          if (productIds.length !== 1) {
            return clarificationResult(
              language,
              detection.intent,
              { ...context, pendingShoppingAction: undefined },
              "Which product would you like me to add?",
            );
          }
          const product = await getProduct(productIds[0]);
          if (product.success === false) {
            return { ...emptyResult("error", language, detection.intent, context), error: product.error };
          }
          return emptyResult(
            "action",
            language,
            "cart_action",
            { ...context, pendingShoppingAction: "confirm_checkout", selectedProductIds: [product.data.id] },
            null,
            [product.data],
            "ADD_TO_CART",
            product.data.id,
          );
        }
        if (isNegative(message.content)) {
          return emptyResult("message", language, detection.intent, {
            ...context,
            pendingShoppingAction: undefined,
          });
        }
      }

      if (previousContext.pendingShoppingAction === "confirm_checkout") {
        if (isAffirmative(message.content)) {
          return emptyResult(
            "navigation",
            language,
            "navigation",
            { ...context, pendingShoppingAction: undefined },
            null,
            [],
            "NAVIGATE_TO_CHECKOUT",
          );
        }
        if (isNegative(message.content)) {
          return emptyResult("message", language, detection.intent, {
            ...context,
            pendingShoppingAction: undefined,
          });
        }
      }

      if (detection.intent === "navigation" && /checkout/i.test(message.content)) {
        return emptyResult(
          "navigation",
          language,
          detection.intent,
          context,
          null,
          [],
          "NAVIGATE_TO_CHECKOUT",
        );
      }

      if (detection.intent === "cart_action" && !detection.entities.query) {
        const productIds = previousContext.lastShownProductIds ?? [];
        if (productIds.length === 1) {
          const product = await getProduct(productIds[0]);
          if (product.success === false) {
            return { ...emptyResult("error", language, detection.intent, context), error: product.error };
          }
          return emptyResult(
            "action",
            language,
            detection.intent,
            { ...context, pendingShoppingAction: "confirm_checkout", selectedProductIds: [product.data.id] },
            null,
            [product.data],
            "ADD_TO_CART",
            product.data.id,
          );
        }
        return clarificationResult(
          language,
          detection.intent,
          context,
          "Sure — which product would you like me to add?",
        );
      }
      const clarification = determineClarification(detection.intent, context);

      if (clarification.needsClarification) {
        return emptyResult(
          "clarification",
          language,
          detection.intent,
          context,
          clarification,
        );
      }

      if (
        detection.intent === "product_search" ||
        detection.intent === "product_recommendation" ||
        (detection.intent === "cart_action" && detection.entities.query)
      ) {
        const result = await searchProducts(toProductQuery(context));
        if (result.success === false) {
          return {
            ...emptyResult("error", language, detection.intent, context),
            error: result.error,
          };
        }

        const products = rankProducts(result.data, context);
        const nextContext: AgentContext = {
          ...context,
          lastSearchQuery: toProductQuery(context),
          lastShownProductIds: products.map((product) => product.id),
          pendingShoppingAction:
            isPurchaseRequest(message.content) && products.length > 0
              ? "confirm_add_to_cart"
              : undefined,
        };
        return emptyResult(
          "product_results",
          language,
          detection.intent,
          nextContext,
          null,
          products,
        );
      }

      if (detection.intent === "product_information" && context.selectedProductIds?.[0]) {
        const result = await getProduct(context.selectedProductIds[0]);
        if (result.success === false) {
          return {
            ...emptyResult("error", language, detection.intent, context),
            error: result.error,
          };
        }
        return emptyResult("product_detail", language, detection.intent, context, null, [
          result.data,
        ]);
      }

      if (
        detection.intent === "product_comparison" &&
        context.selectedProductIds?.length
      ) {
        const result = await compareProducts(context.selectedProductIds);
        if (result.success === false) {
          return {
            ...emptyResult("error", language, detection.intent, context),
            error: result.error,
          };
        }
        return emptyResult(
          "comparison",
          language,
          detection.intent,
          context,
          null,
          result.data,
        );
      }

      return emptyResult("message", language, detection.intent, context);
    },
  };
};

export const agentOrchestrator = createAgentOrchestrator();

export const processAgentMessage = agentOrchestrator.processAgentMessage;
