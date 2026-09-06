import type { Product } from "@/lib/types";
import type { AgentProductService } from "@/agent/services/productService";
import type { ToolResult } from "@/agent/tools/types";

export const createCompareProductsTool =
  (productService: AgentProductService) =>
  async (productIds: string[]): Promise<ToolResult<Product[]>> => {
    if (productIds.length < 2) {
      return { success: false, error: "At least two product IDs are required." };
    }

    try {
      const products = await Promise.all(productIds.map((id) => productService.getById(id)));
      const found = products.filter((product): product is Product => product !== null);
      return found.length === productIds.length
        ? { success: true, data: found }
        : { success: false, error: "One or more products were not found in Be-Zone data." };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Product comparison failed.",
      };
    }
  };
