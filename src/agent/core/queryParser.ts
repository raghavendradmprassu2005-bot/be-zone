import type { AgentQueryEntities } from "@/agent/types";

const CATEGORY_TERMS = [
  ["face wash", "face wash"],
  ["moisturizer", "moisturizer"],
  ["serum", "serum"],
  ["sunscreen", "sunscreen"],
  ["lipstick", "lipstick"],
  ["foundation", "foundation"],
  ["shampoo", "shampoo"],
  ["conditioner", "conditioner"],
  ["hair oil", "hair oil"],
  ["perfume", "perfume"],
  ["cleanser", "cleanser"],
  ["toner", "toner"],
] as const;

const findAmount = (text: string, pattern: RegExp): number | undefined => {
  const match = text.match(pattern);
  if (!match) return undefined;
  const amount = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : undefined;
};

const PRODUCT_QUERY_STOP_WORDS = /\b(?:show|find|search|looking|for|me|a|an|the|product|products|please|can|you|get|want|need|nanige|beku|kodi|torisu|order|madu|maadi|ge|cart|add|to|my|it|this|that|idu|adu|adanna)\b/gi;

export const parseQuery = (message: string): AgentQueryEntities => {
  const text = message.toLowerCase().replace(/,/g, "");
  const category = CATEGORY_TERMS.find(([term]) =>
    new RegExp(`\\b${term}s?\\b`, "i").test(text),
  )?.[1];
  const maxPrice =
    findAmount(
      text,
      /(?:under|below|less than|within|olage|budget(?: of)?|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i,
    ) ??
    findAmount(text, /(\d+)\s*(?:rupees?|rs\.?|inr)\b/i) ??
    findAmount(text, /(\d+)\s*(?:ke\s*)?(?:olage|under|below)\b/i) ??
    findAmount(text, /(?:₹|rs\.?|inr)\s*(\d+)/i);
  const glowQuery = /\bglow(?:ing)?(?:\s+skin)?\b/i.test(text) ? "glow" : undefined;
  const freeTextQuery = text
    .replace(/(?:under|below|less than|within|olage|upto|up to)\s*(?:₹|rs\.?|inr)?\s*\d+/gi, "")
    .replace(/(?:₹|rs\.?|inr)\s*\d+/gi, "")
    .replace(/\d+\s*(?:rupees?|rs\.?|inr)\b/gi, "")
    .replace(PRODUCT_QUERY_STOP_WORDS, " ")
    .replace(/[^\p{L}\p{N}&]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
  const normalizedCategoryQuery =
    category && (freeTextQuery === category || freeTextQuery === `${category}s`)
      ? category
      : freeTextQuery;
  const query = normalizedCategoryQuery.length >= 2 ? normalizedCategoryQuery : category ?? glowQuery;
  const skinType = /\boily\s+skin\b/i.test(text)
    ? "oily skin"
    : /\bdry\s+skin\b/i.test(text)
      ? "dry skin"
      : undefined;
  const concern = skinType ?? (/\bacne\b|\bpimples?\b/i.test(text) ? "acne" : undefined);
  const productIds = [...text.matchAll(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi)].map(
    ([id]) => id,
  );

  return {
    category,
    query,
    budget: maxPrice,
    maxPrice,
    concern,
    skinType,
    productIds: productIds.length ? productIds : undefined,
  };
};
