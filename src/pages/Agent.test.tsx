import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Agent from "@/pages/Agent";
import type { AgentResult } from "@/agent/types";
import type { Product } from "@/lib/types";

const processAgentMessage = vi.hoisted(() => vi.fn());
const generateResponse = vi.hoisted(() => vi.fn());
const addItem = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/agent/core/agentOrchestrator", () => ({
  agentOrchestrator: { processAgentMessage },
}));

vi.mock("@/agent/services/agentService", () => ({
  agentService: { generateResponse },
}));

vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ addItem }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
}));

vi.mock("@/components/ProductCard", () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid="agent-product-card">{product.name}</div>
  ),
}));

const result = (overrides: Partial<AgentResult> = {}): AgentResult => ({
  type: "message",
  language: "english",
  intent: "general_conversation",
  message: null,
  products: [],
  context: {
    detectedLanguage: "english",
    currentIntent: "general_conversation",
    isAuthenticated: false,
  },
  clarification: null,
  ...overrides,
});

describe("Agent page", () => {
  beforeEach(() => {
    processAgentMessage.mockReset();
    generateResponse.mockReset();
    addItem.mockReset();
    navigate.mockReset();
    processAgentMessage.mockResolvedValue(result());
    generateResponse.mockResolvedValue({
      message: "Here is a helpful Be-Zone response.",
      usedFallback: false,
    });
  });

  it("renders the welcome state and suggestion chips", () => {
    render(<Agent />);

    expect(screen.getByRole("heading", { name: "What can I help you find?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show me moisturizers under ₹1000" })).toBeInTheDocument();
  });

  it("shows the user message, thinking state, and agent response", async () => {
    let resolveOrchestrator: (value: AgentResult) => void = () => undefined;
    processAgentMessage.mockReturnValue(
      new Promise<AgentResult>((resolve) => {
        resolveOrchestrator = resolve;
      }),
    );

    render(<Agent />);
    const input = screen.getByRole("textbox", { name: "Message B Agent" });
    fireEvent.change(input, { target: { value: "Find face wash" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Find face wash")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "B Agent is thinking" })).toBeInTheDocument();

    resolveOrchestrator(result({ type: "clarification" }));
    await waitFor(() =>
      expect(screen.getByText("Here is a helpful Be-Zone response.")).toBeInTheDocument(),
    );
    expect(generateResponse).toHaveBeenCalledTimes(1);
  });

  it("renders only products returned by the agent result", async () => {
    const product: Product = {
      id: "verified-product",
      name: "Verified Moisturizer",
      description: "Verified product",
      price: 499,
      category: "beauty-care",
      image: "",
      rating: 4,
      reviewCount: 1,
      tags: ["moisturizer"],
      inStock: true,
    };
    processAgentMessage.mockResolvedValue(
      result({ type: "product_results", products: [product] }),
    );

    render(<Agent />);
    fireEvent.click(screen.getByRole("button", { name: "Show me moisturizers under ₹1000" }));

    await waitFor(() => expect(screen.getByTestId("agent-product-card")).toHaveTextContent(product.name));
    expect(screen.getByText("Here is a helpful Be-Zone response.")).toBeInTheDocument();
  });

  it("renders one assistant response when a product search has no results", async () => {
    processAgentMessage.mockResolvedValue(result({ type: "product_results" }));
    generateResponse.mockResolvedValue({
      message: "I couldn’t find an exact match, but I can help you try a different category or budget.",
      usedFallback: true,
    });

    render(<Agent />);
    fireEvent.click(screen.getByRole("button", { name: "Show me moisturizers under ₹1000" }));

    await waitFor(() =>
      expect(
        screen.getAllByText(
          "I couldn’t find an exact match, but I can help you try a different category or budget.",
        ),
      ).toHaveLength(1),
    );
  });

  it("does not submit whitespace-only input", () => {
    render(<Agent />);
    fireEvent.change(screen.getByRole("textbox", { name: "Message B Agent" }), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(processAgentMessage).not.toHaveBeenCalled();
  });

  it("executes a verified add-to-cart action once", async () => {
    const product: Product = {
      id: "verified-product",
      name: "Verified Moisturizer",
      description: "Verified product",
      price: 499,
      category: "beauty-care",
      image: "",
      rating: 4,
      reviewCount: 1,
      tags: ["moisturizer"],
      inStock: true,
    };
    processAgentMessage.mockResolvedValue(
      result({
        type: "action",
        shoppingAction: "ADD_TO_CART",
        actionProductId: product.id,
        products: [product],
      }),
    );

    render(<Agent />);
    fireEvent.change(screen.getByRole("textbox", { name: "Message B Agent" }), {
      target: { value: "add it" },
    });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Message B Agent" }), { key: "Enter" });

    await waitFor(() => expect(addItem).toHaveBeenCalledWith(product, false));
    expect(screen.getAllByText("Done. I've added it to your cart. Would you like to continue to checkout?")).toHaveLength(1);
    expect(generateResponse).not.toHaveBeenCalled();
  });
});
