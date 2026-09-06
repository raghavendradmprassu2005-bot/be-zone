import { CATEGORIES, type Category } from "@/lib/types";
import type { ToolResult } from "@/agent/tools/types";

export interface AgentCategory {
  id: Category;
  name: string;
  description: string;
}

export const searchCategories = (query?: string): ToolResult<AgentCategory[]> => {
  const normalized = query?.trim().toLowerCase();
  const categories = CATEGORIES
    .filter((category) =>
      !normalized ||
      category.name.toLowerCase().includes(normalized) ||
      category.description.toLowerCase().includes(normalized),
    )
    .map(({ id, name, description }) => ({ id, name, description }));

  return { success: true, data: categories };
};
