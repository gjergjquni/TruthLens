import axios from "axios";
import type { AnalysisResult } from "./types";

export interface AnalyzeClaimRequest {
  text: string;
}

export interface AnalyzeClaimResponse {
  analysis: AnalysisResult;
}

export async function analyzeClaim(text: string): Promise<AnalysisResult> {
  const payload: AnalyzeClaimRequest = { text };
  try {
    const { data } = await axios.post<AnalyzeClaimResponse>("/api/claims/analyze", payload);
    return data.analysis;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(String(err.response.data.error));
    }
    throw err;
  }
}

