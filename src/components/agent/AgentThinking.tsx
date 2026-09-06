import { motion } from "framer-motion";

const AgentThinking = () => (
  <div
    className="flex items-center gap-3 px-1 text-sm text-[#8d867d]"
    role="status"
    aria-label="B Agent is thinking"
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c4921a]/50 font-display text-[#e3c07a]">
      B
    </span>
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-[#e3c07a]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: dot * 0.15 }}
        />
      ))}
    </span>
    <span className="text-xs tracking-wide">finding the right options</span>
  </div>
);

export default AgentThinking;
