import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { analyzeClaim } from "./api";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { ClaimInputHero } from "./components/ClaimInputHero";
import { LayoutShell } from "./components/LayoutShell";
import type { AnalysisResult } from "./types";

const App: React.FC = () => {
  const [claim, setClaim] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!claim.trim()) return;
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzeClaim(claim.trim());
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "The analysis engine is currently unavailable. Ensure the backend is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutShell>
      <div className="flex flex-1 flex-col gap-6">
        <ClaimInputHero
          value={claim}
          onChange={setClaim}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="glass-panel flex flex-col items-center justify-center gap-3 rounded-3xl p-6 text-sm text-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9">
                  <div className="absolute inset-0 rounded-full border border-primary/40" />
                  <div className="absolute inset-1 rounded-full border-t-2 border-t-primary/80 border-r-2 border-r-transparent animate-spin" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Running Evidence Synthesis
                  </div>
                  <div className="text-sm text-slate-200">
                    Scoring sources by citations, design hierarchy, and recency…
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!isLoading && analysis && (
            <AnalysisDashboard key={analysis.id} analysis={analysis} />
          )}

          {!isLoading && !analysis && !error && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="glass-panel flex flex-col items-center justify-center rounded-3xl px-4 py-3 sm:px-5 sm:py-4 text-center text-sm text-slate-300"
            >
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Awaiting Claim
              </div>
              <p>
                Provide a testable statement. TruthLens calculates a clear consensus score.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-red-500/40 bg-red-500/10 text-sm text-red-100 rounded-3xl p-4"
          >
            {error}
          </motion.div>
        )}
      </div>
    </LayoutShell>
  );
};

export default App;

