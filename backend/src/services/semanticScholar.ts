/**
 * Mock Semantic Scholar integration: returns synthetic papers for a claim.
 * In production, replace with real Semantic Scholar API calls.
 */

import type { RawSource } from "./credibility";
import type { StudyType } from "./credibility";
import { STUDY_TYPES } from "./credibility";

const MOCK_TITLES = [
  "Systematic review and meta-analysis of outcomes in adult populations",
  "Randomized controlled trial of intervention effects on primary endpoints",
  "Cohort study of long-term follow-up and subgroup analyses",
  "Observational study of real-world effectiveness and safety",
  "Expert consensus and narrative review of current evidence",
  "Meta-analysis of randomized trials and sensitivity analyses",
  "Multicenter RCT with blinded outcome assessment",
  "Prospective cohort with propensity score matching",
  "Cross-sectional observational study and survey data",
  "Commentary and opinion on emerging evidence",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seedFromText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Generates a deterministic but varied set of mock sources for the claim text.
 */
export function mockFetchSemanticScholar(claimText: string): RawSource[] {
  const seed = seedFromText(claimText);
  const rng = (i: number) => {
    const x = Math.sin(seed * (i + 1) * 0.1) * 10000;
    return x - Math.floor(x);
  };

  const count = 5 + Math.floor(rng(0) * 6); // 5–10 sources
  const sources: RawSource[] = [];
  const usedTitles = new Set<string>();

  for (let i = 0; i < count; i++) {
    let title = pick(MOCK_TITLES);
    while (usedTitles.has(title)) {
      title = pick(MOCK_TITLES);
    }
    usedTitles.add(title);

    const studyType = STUDY_TYPES[Math.floor(rng(i + 10) * STUDY_TYPES.length)] as StudyType;
    const year = 2015 + Math.floor(rng(i + 20) * 10);
    const citationCount = Math.floor(10 + rng(i + 30) * 2000);

    sources.push({
      title: `${title} (${claimText.slice(0, 30)}…)`,
      year,
      citationCount,
      studyType,
    });
  }

  return sources;
}
