import { motion } from "framer-motion";
import React from "react";
import {
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from "recharts";
import type { AnalysisResult, MisinformationRisk } from "../types";
import { CircularConsensusGauge } from "./CircularConsensusGauge";

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
}

const studyTypeColors: Record<string, string> = {
  "Meta-analysis": "#22c55e",
  RCT: "#2dd4bf",
  Cohort: "#38bdf8",
  Observational: "#a855f7",
  Opinion: "#f97316"
};

const riskColorMap: Record<MisinformationRisk, string> = {
  Low: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  Medium: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  High: "bg-orange-500/15 text-orange-200 border-orange-400/40"
};

const riskDotColorMap: Record<MisinformationRisk, string> = {
  Low: "bg-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.9)]",
  Medium: "bg-amber-300 shadow-[0_0_14px_rgba(234,179,8,0.9)]",
  High: "bg-orange-300 shadow-[0_0_14px_rgba(249,115,22,0.9)]"
};

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ analysis }) => {
  const { misinformationRisk, consensusScore } = analysis;

  const riskDescriptor =
    misinformationRisk === "Low"
      ? "Evidence base broadly converges on this claim."
      : misinformationRisk === "Medium"
      ? "Evidence is mixed or methodologically heterogeneous."
      : "Substantial uncertainty, disagreement, or low-quality evidence.";

  const factOpinionText = `${
    Math.round(analysis.factOpinionBreakdown.factualWeightPercent) || 0
  }% of weighted evidence comes from empirical study designs (meta-analyses, RCTs, cohort, observational), while ${
    Math.round(analysis.factOpinionBreakdown.opinionWeightPercent) || 0
  }% is derived from opinion-style or low-inference sources.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-6"
    >
      <div className="glass-panel rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Current Claim
            </div>
            <div className="mt-1 text-sm sm:text-base text-slate-50">
              “{analysis.claimText}”
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:justify-end">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${riskColorMap[misinformationRisk]}`}
            >
              <span className={`h-2 w-2 rounded-full ${riskDotColorMap[misinformationRisk]}`} />
              <span>Misinformation risk: {misinformationRisk}</span>
            </div>
            <div className="hidden text-[11px] text-slate-400 sm:block">
              Generated at{" "}
              {new Date(analysis.createdAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <CircularConsensusGauge
          score={consensusScore}
          label={
            consensusScore >= 70
              ? "High alignment with current evidence base"
              : consensusScore >= 40
              ? "Partial or conditional support"
              : "Weak or conflicting empirical support"
          }
        />

        <div className="flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Misinformation Risk Profile
              </div>
            </div>
            <p className="text-sm text-slate-200">{riskDescriptor}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              Risk is inferred from the balance, quality, and agreement of sources, not from
              social media prevalence or real-time fact-checking feeds.
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-4 sm:p-5">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Fact vs Opinion Breakdown
            </div>
            <p className="text-sm text-slate-200">{factOpinionText}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="glass-panel rounded-3xl p-4 sm:p-5"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Study Type Distribution
            </div>
            <div className="text-[11px] text-slate-400">
              n = {analysis.sources.length} sources
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysis.studyTypeDistribution}
                  dataKey="count"
                  nameKey="studyType"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  stroke="rgba(15,23,42,0.9)"
                  strokeWidth={2}
                >
                  {analysis.studyTypeDistribution.map((entry) => (
                    <Cell
                      key={entry.studyType}
                      fill={studyTypeColors[entry.studyType] ?? "#6366f1"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.25)",
                    padding: "8px 12px"
                  }}
                  labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
                  itemStyle={{ color: "#e5e7eb", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
            {analysis.studyTypeDistribution.map((item) => (
              <span
                key={item.studyType}
                className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 border border-white/10"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: studyTypeColors[item.studyType] }}
                />
                <span>{item.studyType}</span>
                <span className="text-slate-400">({item.count})</span>
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass-panel rounded-3xl p-4 sm:p-5"
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Credibility Over Time
            </div>
            <div className="text-[11px] text-slate-400">
              Weighted by citations × design × recency
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  analysis.credibilityOverTime.length > 0
                    ? analysis.credibilityOverTime
                    : [{ year: new Date().getFullYear(), totalWeight: 0 }]
                }
              >
                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    borderRadius: 16,
                    border: "1px solid rgba(148,163,184,0.25)",
                    padding: "8px 12px"
                  }}
                  labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
                  itemStyle={{ color: "#e5e7eb", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="totalWeight"
                  stroke="#8b5cf6"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="glass-panel rounded-3xl p-4 sm:p-5"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Sources Analyzed
          </div>
          <div className="text-[11px] text-slate-400">
            Weighted by log citations, design hierarchy, and recency
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {analysis.sources.map((source, index) => (
            <motion.details
              key={source.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              className="group rounded-3xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm open:bg-white/7"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-50">{source.title}</span>
                    <span className="rounded-full bg-white/10 px-2 py-[2px] text-[10px] text-slate-300 border border-white/10">
                      {source.studyType}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>{source.year}</span>
                    <span>citations: {source.citationCount.toLocaleString()}</span>
                    <span>
                      weight:{" "}
                      <span className="text-slate-200">
                        {source.credibilityWeight.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
                <span className="ml-2 text-xs text-slate-400 group-open:rotate-90 transition-transform">
                  ▶
                </span>
              </summary>
              <div className="mt-2 text-[12px] text-slate-300">
                This record represents a synthesized abstract from a scholarly index. In a
                full deployment, TruthLens ingests abstracts, methods, and key outcomes to
                refine weighting beyond citation counts and design hierarchy.
              </div>
            </motion.details>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.14 }}
        className="glass-panel rounded-3xl p-4 sm:p-5"
      >
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Knowledge Gaps & Interpretation
        </div>
        <p className="text-sm text-slate-200">{analysis.knowledgeGapsSummary}</p>
        <p className="mt-3 text-[11px] text-slate-400">
          This section describes structural limitations of the current evidence base. It
          does not constitute clinical, policy, or investment advice.
        </p>
      </motion.div>
    </motion.section>
  );
};

