/**
 * Credibility scoring: weight = (log(citationCount + 1) * studyTypeWeight) / (currentYear - year + 1)
 * Consensus score = weighted average of source alignment, normalized to 0–100.
 */

export const STUDY_TYPES = [
  "Meta-analysis",
  "RCT",
  "Cohort",
  "Observational",
  "Opinion",
] as const;

export type StudyType = (typeof STUDY_TYPES)[number];

export const STUDY_TYPE_WEIGHTS: Record<StudyType, number> = {
  "Meta-analysis": 5,
  RCT: 4,
  Cohort: 3,
  Observational: 2,
  Opinion: 1,
};

const CURRENT_YEAR = new Date().getFullYear();

export interface RawSource {
  title: string;
  year: number;
  citationCount: number;
  studyType: StudyType;
}

export interface WeightedSource extends RawSource {
  credibilityWeight: number;
}

export function computeCredibilityWeight(
  citationCount: number,
  year: number,
  studyType: StudyType
): number {
  const studyWeight = STUDY_TYPE_WEIGHTS[studyType];
  const logCitations = Math.log(citationCount + 1);
  const recencyFactor = CURRENT_YEAR - year + 1;
  return (logCitations * studyWeight) / recencyFactor;
}

export function weightSources(sources: RawSource[]): WeightedSource[] {
  return sources.map((s) => ({
    ...s,
    credibilityWeight: computeCredibilityWeight(
      s.citationCount,
      s.year,
      s.studyType
    ),
  }));
}

/**
 * Consensus score 0–100: weighted average of synthetic "alignment" (0–1) per source.
 * In production this would reflect actual support/contradiction from abstracts.
 */
export function computeConsensusScore(weighted: WeightedSource[]): number {
  if (weighted.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const s of weighted) {
    // Synthetic alignment: slight bias toward support for demo (0.5–0.95)
    const alignment = 0.5 + (s.credibilityWeight / (s.credibilityWeight + 3)) * 0.45;
    totalWeight += s.credibilityWeight;
    weightedSum += s.credibilityWeight * alignment;
  }
  const score = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10));
}

export type MisinformationRisk = "Low" | "Medium" | "High";

export function assessMisinformationRisk(
  consensusScore: number,
  sourceCount: number,
  opinionShare: number
): MisinformationRisk {
  if (consensusScore >= 65 && sourceCount >= 5 && opinionShare < 0.25)
    return "Low";
  if (consensusScore <= 35 || opinionShare > 0.5) return "High";
  return "Medium";
}

export function getStudyTypeDistribution(
  sources: WeightedSource[]
): { studyType: StudyType; count: number }[] {
  const counts: Record<StudyType, number> = {
    "Meta-analysis": 0,
    RCT: 0,
    Cohort: 0,
    Observational: 0,
    Opinion: 0,
  };
  for (const s of sources) counts[s.studyType]++;
  return STUDY_TYPES.map((studyType) => ({
    studyType,
    count: counts[studyType],
  })).filter((x) => x.count > 0);
}

export function getCredibilityOverTime(
  sources: WeightedSource[]
): { year: number; totalWeight: number }[] {
  const byYear: Record<number, number> = {};
  for (const s of sources) {
    byYear[s.year] = (byYear[s.year] ?? 0) + s.credibilityWeight;
  }
  return Object.entries(byYear)
    .map(([year, totalWeight]) => ({ year: Number(year), totalWeight }))
    .sort((a, b) => a.year - b.year);
}

const FACTUAL_TYPES: StudyType[] = ["Meta-analysis", "RCT", "Cohort", "Observational"];

export function getFactOpinionBreakdown(
  sources: WeightedSource[]
): { factualWeightPercent: number; opinionWeightPercent: number } {
  let factual = 0;
  let opinion = 0;
  for (const s of sources) {
    if (FACTUAL_TYPES.includes(s.studyType)) factual += s.credibilityWeight;
    else opinion += s.credibilityWeight;
  }
  const total = factual + opinion;
  if (total === 0) return { factualWeightPercent: 50, opinionWeightPercent: 50 };
  return {
    factualWeightPercent: (factual / total) * 100,
    opinionWeightPercent: (opinion / total) * 100,
  };
}
