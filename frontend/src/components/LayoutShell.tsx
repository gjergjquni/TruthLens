import { motion } from "framer-motion";
import React from "react";

interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-truthlens-gradient text-slate-100">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-16">
        <header className="mt-1">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_32px_rgba(168,85,247,0.45)]">
                <svg
                  viewBox="0 0 1200 500"
                  aria-hidden="true"
                  className="h-8 w-8 text-primary"
                >
                  <defs>
                    <linearGradient id="truthlensHelix" x1="0%" y1="50%" x2="100%" y2="50%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                    <filter id="truthlensGlow" x="-20%" y="-40%" width="140%" height="180%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur1" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="36" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur1" />
                        <feMergeNode in="blur2" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <g
                    filter="url(#truthlensGlow)"
                    fill="none"
                    stroke="url(#truthlensHelix)"
                    strokeWidth={38}
                    strokeLinecap="round"
                  >
                    <path d="M80 360 C 260 80, 420 80, 600 360 S 940 640, 1120 120" />
                    <path d="M80 140 C 260 420, 420 420, 600 140 S 940 -120, 1120 360" />
                  </g>
                  <g filter="url(#truthlensGlow)">
                    <g>
                      <circle cx="260" cy="250" r="46" fill="#a855f7" opacity="0.3" />
                      <circle cx="260" cy="250" r="22" fill="#ffffff" />
                    </g>
                    <g>
                      <circle cx="480" cy="220" r="46" fill="#8b5cf6" opacity="0.3" />
                      <circle cx="480" cy="220" r="22" fill="#ffffff" />
                    </g>
                    <g>
                      <circle cx="700" cy="260" r="46" fill="#6366f1" opacity="0.32" />
                      <circle cx="700" cy="260" r="22" fill="#ffffff" />
                    </g>
                    <g>
                      <circle cx="920" cy="230" r="46" fill="#22c55e" opacity="0.32" />
                      <circle cx="920" cy="230" r="22" fill="#ffffff" />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">TruthLens</h1>
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 text-[10px] uppercase tracking-[0.24em] text-slate-100">
                    Scientific Consensus Engine
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  An AI-native interface for quantitative evidence synthesis.
                </p>
              </div>
            </div>

            <div className="hidden text-right text-xs text-slate-400 sm:block">
              <p className="uppercase tracking-[0.24em] text-slate-500">
                Research Platform
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Designed for high-signal scientific review.
              </p>
            </div>
          </motion.div>
        </header>

        <main className="mx-auto mt-10 sm:mt-16 flex w-full max-w-6xl flex-1 flex-col gap-6">
          {children}
        </main>

        <footer className="mt-8 flex justify-center text-[11px] text-slate-500">
          <span>
            This is a research tool and does not replace expert scientific review. TruthLens 2026 ©. 
          </span>
        </footer>
      </div>
    </div>
  );
};

