import { motion } from "framer-motion";
import type { AgentResult } from "@/agent/types";
import AgentProductResults from "@/components/agent/AgentProductResults";

interface AgentMessageBubbleProps {
  content: string;
  role: "user" | "assistant";
  result?: AgentResult;
}

const AgentMessageBubble = ({
  content,
  role,
  result,
}: AgentMessageBubbleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className={`flex ${role === "user" ? "justify-end" : "justify-start"} px-1`}
  >
    <div
      className={`max-w-[min(92%,42rem)] ${
        role === "user"
          ? "border-r border-[#c4921a]/45 pr-4 text-right text-[#c9c1b7]"
          : "text-[#f4f0e8]"
      }`}
    >
      {role === "assistant" && (
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#a9a29a]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#c4921a]/55 font-display text-[12px] text-[#e3c07a]">
            B
          </span>
          <span>Be-Zone</span>
        </div>
      )}
      <p className="whitespace-pre-wrap text-[15px] leading-7">{content}</p>
      {result &&
        (result.type === "product_results" ||
          result.type === "product_detail" ||
          result.type === "comparison") && (
          <AgentProductResults products={result.products} />
        )}
    </div>
  </motion.div>
);

export default AgentMessageBubble;
