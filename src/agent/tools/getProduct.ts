import type { Product } from "@/lib/types";
import type { AgentProductService } from "@/agent/services/productService";
import type { ToolResult } from "@/agent/tools/types";

export const createGetProductTool =
  (productService: AgentProductService) =>
  async (productId: string): Promise<ToolResult<Product>> => {
    try {
      const product = await productService.getById(productId);
      return product
        ? { success: true, data: product }
        : { success: false, error: "Product was not found in Be-Zone data." };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Product lookup failed.",
      };
    }
  };
