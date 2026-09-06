import { supabase } from "@/integrations/supabase/client";
import type {
  AgentAIRequest,
  AgentAIResponse,
} from "@/agent/types";

export interface AgentService {
  generateResponse(input: AgentAIRequest): Promise<AgentAIResponse>;
}

const fallbackMessage = (
  language: AgentAIRequest["language"],
  result: AgentAIRequest["result"],
): string => {
  const resultType = result.type;
  if (resultType === "clarification") {
    if (language === "kannada") {
      return "ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಉತ್ಪನ್ನ ಬೇಕು ಎಂದು ಹೇಳಿ — skincare, makeup ಅಥವಾ haircare?";
    }
    if (language === "kanglish") {
      return "Sure 😊 Nimge yava type product beku — skincare, makeup athava haircare?";
    }
    return "What are you looking for — skincare, makeup, haircare, or something else?";
  }

  if (resultType === "product_results") {
    if (!result.products.length) {
      if (result.context.pendingShoppingAction === "confirm_add_to_cart") {
        if (language === "kannada") {
          return "ನಿಮಗಾಗಿ ಈ ಉತ್ಪನ್ನ ಸಿಕ್ಕಿದೆ. ಇದನ್ನು cart ಗೆ ಸೇರಿಸಬೇಕೇ?";
        }
        if (language === "kanglish") {
          return "Nimagaagi ee product sigide. Idanna cart-ge add madona?";
        }
        return "I found this for you. Would you like me to add it to your cart?";
      }
      if (language === "kannada") {
        return "ನಿಖರವಾದ ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲ. ಬೇರೆ category ಅಥವಾ budget ಪ್ರಯತ್ನಿಸೋಣ.";
      }
      if (language === "kanglish") {
        return "Exact match siglilla. Bere category athava budget try madona.";
      }
      return "I couldn’t find an exact match, but I can help you try a different category or budget.";
    }
    if (language === "kannada") {
      return "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ Be-Zone ಉತ್ಪನ್ನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.";
    }
    if (language === "kanglish") {
      return "Be-Zone data-nalli sigida products illive. Nimma skin type helidre inna narrow down madbahudu.";
    }
    return "Here are the Be-Zone products found for your search.";
  }

  if (language === "kannada") {
    return "ನನ್ನ AI ಸಹಾಯಕವನ್ನು ಸಂಪರ್ಕಿಸಲು ಈಗ ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.";
  }
  if (language === "kanglish") {
    return "Nanna AI assistant-ge connect agalu iga swalpa trouble ide. Swalpa time bittu try madi.";
  }
  return "I’m having trouble connecting to my AI assistant right now, but I can still help you search Be-Zone products.";
};

const fallbackResponse = (input: AgentAIRequest): AgentAIResponse => ({
  message: fallbackMessage(input.language, input.result),
  usedFallback: true,
});

export class SupabaseAgentService implements AgentService {
  async generateResponse(input: AgentAIRequest): Promise<AgentAIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke("be-zone-agent", {
        body: input,
      });

      if (
        error ||
        !data ||
        typeof data.message !== "string" ||
        !data.message.trim()
      ) {
        return fallbackResponse(input);
      }

      return {
        message: data.message,
        usedFallback: false,
      };
    } catch {
      return fallbackResponse(input);
    }
  }
}

export const agentService: AgentService = new SupabaseAgentService();

export const createUnavailableAgentService = (): AgentService => ({
  async generateResponse(input) {
    return fallbackResponse(input);
  },
});
