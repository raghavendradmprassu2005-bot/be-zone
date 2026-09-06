import type { DetectedAgentLanguage } from "@/agent/types";

const KANNADA_SCRIPT = /[\u0C80-\u0CFF]/u;
const KANGLISH_MARKERS =
  /\b(nanage|beku|beeku|ide|ge|olage|madi|maadi|yenadru|enadru|kodi|suggest madi)\b/i;

export const detectLanguage = (message: string): DetectedAgentLanguage => {
  const text = message.trim();
  if (!text) return "unknown";

  const hasKannada = KANNADA_SCRIPT.test(text);
  const hasLatin = /[A-Za-z]/.test(text);

  if (hasKannada) return "kannada";
  if (KANGLISH_MARKERS.test(text)) return "kanglish";
  if (hasLatin) return "english";
  return "unknown";
};
