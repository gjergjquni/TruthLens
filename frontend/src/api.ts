import axios from "axios";
import type { AnalysisResult } from "./types";

const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ?? "/webhook/truthlens";

export interface N8nWebhookPayload {
  message: string;
  id: string;
  timestamp: string;
  conversationId?: string;
  /** Full conversation history: user and assistant messages in order. */
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AnalyzeClaimRequest {
  text: string;
}

export interface AnalyzeClaimResponse {
  analysis: AnalysisResult;
}

/** Webhook can return markdown (preferred) or full analysis. */
export interface N8nWebhookMarkdownResponse {
  markdown: string;
}

/** Keys we treat as text/markdown from the webhook (any kind of text). */
const TEXT_KEYS = ["output", "markdown", "text", "message", "content", "response", "body", "result", "data"];

function getTextFromObject(obj: Record<string, unknown>): string | null {
  for (const key of TEXT_KEYS) {
    const val = obj[key];
    if (val == null) continue;
    if (typeof val === "string" && val.trim().length > 0) return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === "string" && val.trim().length > 0) return val;
    if (typeof val === "number" || typeof val === "boolean") return String(val);
  }
  return null;
}

function extractMarkdown(data: unknown): string | null {
  if (typeof data === "string") return data.trim().length > 0 ? data.trim() : null;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (data == null || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === "object" && obj[0] !== null) {
    const fromFirst = getTextFromObject(obj[0] as Record<string, unknown>);
    if (fromFirst != null) return fromFirst;
  }
  const fromObj = getTextFromObject(obj);
  if (fromObj != null) return fromObj;
  if (obj.json != null && typeof obj.json === "object") {
    const fromJson = getTextFromObject(obj.json as Record<string, unknown>);
    if (fromJson != null) return fromJson;
  }
  return null;
}

export type AnalyzeResult =
  | { type: "markdown"; markdown: string }
  | { type: "analysis"; analysis: AnalysisResult };

function generateId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `tl-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function isAnalysisResult(obj: unknown): obj is AnalysisResult {
  return (
    typeof obj === "object" &&
    obj != null &&
    "claimText" in obj &&
    "consensusScore" in obj
  );
}

/** Sends claim to n8n webhook with full conversation history; returns markdown or analysis. */
export async function analyzeClaim(
  text: string,
  options?: { conversationId?: string; conversation: Array<{ role: "user" | "assistant"; content: string }> }
): Promise<AnalyzeResult> {
  const conversation = options?.conversation ?? [];
  const payload: N8nWebhookPayload = {
    message: text.trim(),
    id: generateId(),
    timestamp: new Date().toISOString(),
    conversation,
    ...(options?.conversationId ? { conversationId: options.conversationId } : {})
  };
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: { "Content-Type": "application/json" },
      transformResponse: [(body) => {
        if (typeof body === "string") {
          try {
            return JSON.parse(body) as unknown;
          } catch {
            return body;
          }
        }
        return body;
      }]
    });
    const data = response.data;
    const markdown = extractMarkdown(data);
    if (markdown != null) {
      return { type: "markdown", markdown };
    }
    const isObj = data != null && typeof data === "object";
    if (!isObj) {
      throw new Error("Webhook did not return valid JSON or text.");
    }
    if ("analysis" in data) {
      return { type: "analysis", analysis: (data as AnalyzeClaimResponse).analysis };
    }
    if (isAnalysisResult(data)) {
      return { type: "analysis", analysis: data };
    }
    throw new Error("Webhook response must include text (e.g. output, markdown, message) or analysis.");
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw new Error(String(err.response.data.error));
    }
    throw err;
  }
}

// --- Conversations (backend) ---

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export async function createConversation(): Promise<{ id: string }> {
  const { data } = await axios.post<{ id: string }>("/api/conversations", {});
  return data;
}

export async function getMessages(conversationId: string): Promise<{ messages: Message[] }> {
  const { data } = await axios.get<{ messages: Message[] }>(
    `/api/conversations/${conversationId}/messages`
  );
  return data;
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<Message> {
  const { data } = await axios.post<Message>(
    `/api/conversations/${conversationId}/messages`,
    { role, content }
  );
  return data;
}

