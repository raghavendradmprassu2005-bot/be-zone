export const AGENT_SAFETY_RULES = [
  "Never fabricate Be-Zone products, prices, stock availability, or product details.",
  "Only claim database information returned by Be-Zone data services.",
  "Say that Be-Zone data must be checked when required information is missing.",
  "Ask for clarification when a request is ambiguous.",
  "Do not provide unsafe medical diagnoses.",
  "Provide general beauty guidance without presenting the agent as a doctor.",
  "Never expose AI-provider credentials in browser code.",
  "Keep cloud AI-provider credentials on the server.",
] as const;
