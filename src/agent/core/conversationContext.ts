import type {
  AgentContext,
  AgentMessage,
  DetectedAgentLanguage,
  IntentDetection,
} from "@/agent/types";

export const updateConversationContext = (
  previous: AgentContext,
  message: AgentMessage,
  language: DetectedAgentLanguage,
  detection: IntentDetection,
): AgentContext => {
  const entities = detection.entities;
  const query = entities.query ?? previous.query;
  const category = entities.category ?? previous.category;
  const maxPrice = entities.maxPrice ?? previous.maxPrice;

  return {
    ...previous,
    language,
    detectedLanguage: language === "unknown" ? previous.detectedLanguage : language,
    currentIntent: detection.intent,
    currentRequest: message.content,
    category,
    query,
    budget: entities.budget ?? previous.budget,
    minPrice: entities.minPrice ?? previous.minPrice,
    maxPrice,
    concern: entities.concern ?? previous.concern,
    skinType: entities.skinType ?? previous.skinType,
    brand: entities.brand ?? previous.brand,
    selectedProductIds: entities.productIds ?? previous.selectedProductIds,
    productQuery: {
      searchTerm: query,
      minPrice: entities.minPrice ?? previous.minPrice,
      maxPrice,
      inStockOnly: true,
    },
    pendingShoppingAction: previous.pendingShoppingAction,
  };
};
