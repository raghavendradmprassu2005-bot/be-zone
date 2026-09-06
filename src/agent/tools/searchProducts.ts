import type { Product } from "@/lib/types";
import type { AgentProductQuery } from "@/agent/types";
import type { AgentProductService } from "@/agent/services/productService";
import type { ToolResult } from "@/agent/tools/types";

export const createSearchProductsTool =
  (productService: AgentProductService) =>
  async (query: AgentProductQuery): Promise<ToolResult<Product[]>> => {
    try {
      return { success: true, data: await productService.search(query) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Product search failed.",
      };
    }
  };
