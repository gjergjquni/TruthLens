import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import React, { useEffect } from "react";

interface CircularConsensusGaugeProps {
  score: number; // 0-100
  label: string;
}

const SIZE = 220;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CircularConsensusGauge: React.FC<CircularConsensusGaugeProps> = ({
  score,
  label
}) => {
  const safeScore = Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
  const progress = useMotionValue(0);
  const strokeDashoffset = useTransform(
    progress,
    (v) => CIRCUMFERENCE - (v / 100) * CIRCUMFERENCE
  );

  useEffect(() => {
    const controls = animate(progress, safeScore, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1]
    });
    return () => controls.stop();
  }, [safeScore, progress]);

  const riskColor =
    safeScore >= 70 ? "#22c55e" : safeScore >= 40 ? "#eab308" : "#f97316";

  return (
    <div className="glass-panel relative flex flex-col items-center justify-center rounded-3xl p-6 sm:p-7">
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        Scientific Consensus Score
      </div>
      <div className="relative flex items-center justify-center">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="100%" stopColor={riskColor} />
            </linearGradient>
          </defs>

          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(148, 163, 184, 0.25)"
            strokeWidth={STROKE}
            fill="transparent"
          />

          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#gaugeGradient)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            style={{
              strokeDashoffset
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={safeScore}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight"
          >
            {Math.round(safeScore)}
            <span className="text-2xl text-slate-400">%</span>
          </motion.div>
          <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
            Consensus Alignment
          </div>
          <div className="mt-2 rounded-full bg-white/5 px-3 py-1 text-[11px] text-slate-300 border border-white/10">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};

