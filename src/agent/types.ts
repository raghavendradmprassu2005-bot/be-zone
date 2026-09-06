import type { Category, Product } from "@/lib/types";

export type AgentRole = "user" | "assistant" | "system";

export type AgentLanguage = "kannada" | "english" | "kanglish" | "auto";
export type DetectedAgentLanguage = Exclude<AgentLanguage, "auto"> | "unknown";

export type AgentIntent =
  | "product_search"
  | "product_recommendation"
  | "product_information"
  | "product_comparison"
  | "category_discovery"
  | "beauty_guidance"
  | "cart_action"
  | "wishlist_action"
  | "navigation"
  | "general_conversation"
  | "unknown";

export type AgentShoppingAction =
  | "SEARCH_PRODUCT"
  | "SHOW_PRODUCT"
  | "ADD_TO_CART"
  | "VIEW_CART"
  | "REMOVE_FROM_CART"
  | "UPDATE_CART_QUANTITY"
  | "START_CHECKOUT"
  | "COLLECT_CUSTOMER_NAME"
  | "COLLECT_ADDRESS"
  | "COLLECT_PINCODE"
  | "CONFIRM_ORDER"
  | "CANCEL_ORDER"
  | "NAVIGATE_TO_CHECKOUT";

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  createdAt: string;
  language?: AgentLanguage;
  intent?: AgentIntent;
}

export interface AgentConversation {
  id: string;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AgentProductQuery {
  searchTerm?: string;
  searchTerms?: string[];
  category?: Category;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
}

export type AgentAction =
  | { type: "none" }
  | { type: "navigate"; path: string }
  | { type: "open_product"; productId: Product["id"] }
  | { type: "add_to_cart"; productId: Product["id"] }
  | { type: "add_to_wishlist"; productId: Product["id"] };

export interface AgentContext {
  conversation?: AgentConversation;
  detectedLanguage: AgentLanguage;
  currentIntent: AgentIntent;
  currentRequest?: string;
  preferences?: Record<string, string | number | boolean>;
  selectedCategory?: Category;
  productQuery?: AgentProductQuery;
  previousRelevantMessages?: AgentMessage[];
  currentPage?: string;
  isAuthenticated: boolean;
  language?: DetectedAgentLanguage;
  category?: string;
  query?: string;
  budget?: number;
  minPrice?: number;
  maxPrice?: number;
  concern?: string;
  skinType?: string;
  brand?: string;
  selectedProductIds?: string[];
  lastSearchQuery?: AgentProductQuery;
  lastShownProductIds?: string[];
  pendingShoppingAction?: "confirm_add_to_cart" | "confirm_checkout";
}

export interface AgentRequest {
  message: AgentMessage;
  context: AgentContext;
}

export interface AgentResponse {
  message: AgentMessage;
  action?: AgentAction;
  products?: Product[];
}

export interface AgentQueryEntities {
  category?: string;
  query?: string;
  budget?: number;
  minPrice?: number;
  maxPrice?: number;
  concern?: string;
  skinType?: string;
  brand?: string;
  sortPreference?: string;
  productIds?: string[];
}

export interface IntentDetection {
  intent: AgentIntent;
  confidence: number;
  entities: AgentQueryEntities;
}

export interface Clarification {
  needsClarification: boolean;
  question?: string;
  missingInformation: string[];
}

export type AgentResultType =
  | "message"
  | "clarification"
  | "product_results"
  | "product_detail"
  | "comparison"
  | "navigation"
  | "action"
  | "error";

export interface AgentResult {
  type: AgentResultType;
  language: DetectedAgentLanguage;
  intent: AgentIntent;
  message: null;
  products: Product[];
  context: AgentContext;
  clarification: Clarification | null;
  shoppingAction?: AgentShoppingAction;
  actionProductId?: Product["id"];
  error?: string;
}

export interface AgentAIRequest {
  userMessage: string;
  language: DetectedAgentLanguage;
  intent: AgentIntent;
  context: Pick<
    AgentContext,
    | "category"
    | "query"
    | "budget"
    | "minPrice"
    | "maxPrice"
    | "concern"
    | "skinType"
    | "brand"
    | "selectedProductIds"
    | "lastSearchQuery"
    | "lastShownProductIds"
    | "pendingShoppingAction"
  >;
  result: AgentResult;
}

export interface AgentAIResponse {
  message: string;
  usedFallback: boolean;
}
