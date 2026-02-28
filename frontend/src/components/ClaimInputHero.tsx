import { motion } from "framer-motion";
import React from "react";

interface ClaimInputHeroProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ClaimInputHero: React.FC<ClaimInputHeroProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim().length > 0) {
        onSubmit();
      }
    }
  };

  return (
    <section className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
          Quantify scientific consensus on any claim
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
        TruthLens simplifies complex scientific consensus.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-panel mx-auto flex w-full max-w-3xl flex-col items-center justify-center gap-3 rounded-3xl px-4 py-4 sm:px-6 sm:py-5 shadow-glow-primary"
      >
        <label className="flex w-full flex-col gap-2 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            CLAIM UNDER EVALUATION
          </span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="pill-input flex-1"
              placeholder='Type your claim here...'
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <motion.button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || value.trim().length === 0}
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              className="primary-btn mt-2 w-full sm:mt-0 sm:w-auto"
            >
              <span className="relative flex items-center gap-2">
                <span>{isLoading ? "Analyzing…" : "Analyze Claim"}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              </span>
            </motion.button>
          </div>
        </label>
      </motion.div>
    </section>
  );
};

