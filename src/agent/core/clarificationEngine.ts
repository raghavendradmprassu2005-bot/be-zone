import type {
  AgentContext,
  AgentIntent,
  Clarification,
} from "@/agent/types";

export const determineClarification = (
  intent: AgentIntent,
  context: AgentContext,
): Clarification => {
  if (
    (intent === "product_search" || intent === "product_recommendation") &&
    !context.category &&
    !context.query &&
    !context.maxPrice &&
    !context.budget
  ) {
    return {
      needsClarification: true,
      question: "What are you looking for — skincare, makeup, haircare, or something else?",
      missingInformation: ["category"],
    };
  }

  return { needsClarification: false, missingInformation: [] };
};
