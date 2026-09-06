import type { AgentIntent, IntentDetection } from "@/agent/types";
import { parseQuery } from "@/agent/core/queryParser";

const matches = (text: string, pattern: RegExp) => pattern.test(text);

export const detectIntent = (message: string): IntentDetection => {
  const text = message.toLowerCase();
  const entities = parseQuery(message);
  let intent: AgentIntent = "unknown";
  let confidence = 0.5;

  if (matches(text, /\b(add|haki|hakki|cart ge|cart-ge|remove|delete)\b/) && matches(text, /\b(cart|idu|adu|it|this|that)\b/)) {
    intent = "cart_action";
    confidence = 0.94;
  } else if (matches(text, /\b(checkout|go to checkout|checkout ge)\b/)) {
    intent = "navigation";
    confidence = 0.92;
  } else if (matches(text, /\b(compare|versus|vs\.?|difference)\b/)) {
    intent = "product_comparison";
    confidence = 0.95;
  } else if (matches(text, /\b(what is|details?|information|tell me about)\b/)) {
    intent = "product_information";
    confidence = 0.88;
  } else if (matches(text, /\b(suggest|recommend|best|which one|help me choose)\b/)) {
    intent = "product_recommendation";
    confidence = 0.84;
  } else if (
    matches(text, /\b(find|show|search|looking for|need|want|order|buy|get|beku|kodi|torisu)\b/) ||
    entities.category ||
    entities.query
  ) {
    intent = "product_search";
    confidence = entities.category ? 0.9 : 0.78;
  } else if (matches(text, /\b(category|categories|what do you have|browse)\b/)) {
    intent = "category_discovery";
    confidence = 0.84;
  } else if (matches(text, /\b(skin|hair|beauty|routine|glow)\b/)) {
    intent = "beauty_guidance";
    confidence = 0.76;
  } else if (matches(text, /\b(cart|add to cart|buy)\b/)) {
    intent = "cart_action";
    confidence = 0.87;
  } else if (matches(text, /\b(wishlist|save this)\b/)) {
    intent = "wishlist_action";
    confidence = 0.87;
  } else if (matches(text, /\b(go to|open|navigate)\b/)) {
    intent = "navigation";
    confidence = 0.82;
  } else if (matches(text, /\b(hi|hello|hey|namaste)\b/)) {
    intent = "general_conversation";
    confidence = 0.9;
  }

  return { intent, confidence, entities };
};
