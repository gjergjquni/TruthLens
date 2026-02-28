export type StudyType = "Meta-analysis" | "RCT" | "Cohort" | "Observational" | "Opinion";

export type MisinformationRisk = "Low" | "Medium" | "High";

export interface Source {
  id: string;
  claimId: string;
  title: string;
  year: number;
  citationCount: number;
  studyType: StudyType;
  credibilityWeight: number;
}

export interface StudyTypeDistributionItem {
  studyType: StudyType;
  count: number;
}

export interface CredibilityOverTimePoint {
  year: number;
  totalWeight: number;
}

export interface FactOpinionBreakdown {
  factualWeightPercent: number;
  opinionWeightPercent: number;
}

export interface AnalysisResult {
  id: string;
  claimId: string;
  claimText: string;
  misinformationRisk: MisinformationRisk;
  consensusScore: number;
  createdAt: string;
  sources: Source[];
  studyTypeDistribution: StudyTypeDistributionItem[];
  credibilityOverTime: CredibilityOverTimePoint[];
  knowledgeGapsSummary: string;
  factOpinionBreakdown: FactOpinionBreakdown;
}

