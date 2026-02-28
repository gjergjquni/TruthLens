import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  weightSources,
  computeConsensusScore,
  assessMisinformationRisk,
  getStudyTypeDistribution,
  getCredibilityOverTime,
  getFactOpinionBreakdown,
  type WeightedSource,
  type MisinformationRisk,
} from "../services/credibility.js";
import { mockFetchSemanticScholar } from "../services/semanticScholar.js";

export const claimsRouter = Router();

claimsRouter.post("/analyze", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!text) {
    res.status(400).json({ error: "Missing or invalid claim text." });
    return;
  }

  try {
    const claim = await prisma.claim.create({
      data: { text },
    });

    const rawSources = mockFetchSemanticScholar(text);
    const weighted = weightSources(rawSources);
    const consensusScore = computeConsensusScore(weighted);
    const opinionShare =
      weighted.filter((s) => s.studyType === "Opinion").length / Math.max(1, weighted.length);
    const misinformationRisk: MisinformationRisk = assessMisinformationRisk(
      consensusScore,
      weighted.length,
      opinionShare
    );

    const studyTypeDistribution = getStudyTypeDistribution(weighted);
    const credibilityOverTime = getCredibilityOverTime(weighted);
    const factOpinionBreakdown = getFactOpinionBreakdown(weighted);

    const analysisRow = await prisma.analysis.create({
      data: {
        claimId: claim.id,
        misinformationRisk,
        consensusScore,
      },
    });

    const sourcesWithIds: (WeightedSource & { id: string; claimId: string })[] = [];
    for (const s of weighted) {
      const row = await prisma.source.create({
        data: {
          claimId: claim.id,
          title: s.title,
          year: s.year,
          citationCount: s.citationCount,
          studyType: s.studyType,
          credibilityWeight: s.credibilityWeight,
        },
      });
      sourcesWithIds.push({
        id: row.id,
        claimId: row.claimId,
        title: row.title,
        year: row.year,
        citationCount: row.citationCount,
        studyType: row.studyType as WeightedSource["studyType"],
        credibilityWeight: row.credibilityWeight,
      });
    }

    const knowledgeGapsSummary = buildKnowledgeGapsSummary(
      weighted.length,
      studyTypeDistribution,
      factOpinionBreakdown,
      consensusScore
    );

    res.json({
      analysis: {
        id: analysisRow.id,
        claimId: claim.id,
        claimText: claim.text,
        misinformationRisk,
        consensusScore,
        createdAt: analysisRow.createdAt.toISOString(),
        sources: sourcesWithIds,
        studyTypeDistribution,
        credibilityOverTime,
        knowledgeGapsSummary,
        factOpinionBreakdown,
      },
    });
  } catch (err) {
    console.error("Analyze claim error:", err);
    res.status(500).json({
      error: "Analysis failed. Please try again.",
    });
  }
});

function buildKnowledgeGapsSummary(
  sourceCount: number,
  studyTypeDistribution: { studyType: string; count: number }[],
  factOpinion: { factualWeightPercent: number; opinionWeightPercent: number },
  consensusScore: number
): string {
  const parts: string[] = [];
  if (sourceCount < 8) {
    parts.push(
      `The evidence base is small (${sourceCount} sources), so the consensus score should be interpreted with caution.`
    );
  }
  const metaCount = studyTypeDistribution.find((d) => d.studyType === "Meta-analysis")?.count ?? 0;
  if (metaCount === 0) {
    parts.push(
      "No meta-analyses were included; higher-level synthesis could strengthen conclusions."
    );
  }
  if (factOpinion.opinionWeightPercent > 30) {
    parts.push(
      `A notable share of weighted evidence comes from opinion or narrative sources (${Math.round(factOpinion.opinionWeightPercent)}%), which may reduce certainty.`
    );
  }
  if (consensusScore < 50) {
    parts.push(
      "The weighted consensus is below 50%, indicating limited or conflicting empirical support for the claim."
    );
  }
  if (parts.length === 0) {
    parts.push(
      "The current set of sources provides moderate coverage. Replication and additional high-quality studies would improve confidence."
    );
  }
  return parts.join(" ");
}
