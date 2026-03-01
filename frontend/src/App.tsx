import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  addMessage,
  analyzeClaim,
  createConversation,
  getMessages,
  type Message
} from "./api";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { LayoutShell } from "./components/LayoutShell";

const App: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { id } = await createConversation();
        if (cancelled) return;
        setConversationId(id);
        setBackendAvailable(true);
        const { messages: list } = await getMessages(id);
        if (cancelled) return;
        setMessages(list);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setConversationId(null);
          setBackendAvailable(false);
          setMessages([]);
        }
      } finally {
        if (!cancelled) setInitLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setError(null);
    const userMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    try {
      if (conversationId) {
        const savedUserMsg = await addMessage(conversationId, "user", text);
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? savedUserMsg : m))
        );
      }
      const result = await analyzeClaim(text, {
        conversationId: conversationId ?? undefined,
        conversation: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: text }
        ]
      });
      const replyContent =
        result.type === "markdown" ? result.markdown : JSON.stringify(result.analysis);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: replyContent,
        createdAt: new Date().toISOString()
      };
      if (conversationId) {
        const saved = await addMessage(conversationId, "assistant", replyContent);
        setMessages((prev) => [...prev, saved]);
      } else {
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to get reply. Check n8n is running and webhook is active."
      );
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (initLoading) {
    return (
      <LayoutShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
          <p className="text-sm">Starting conversation…</p>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="flex flex-1 flex-col gap-4">
        {!backendAvailable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-100"
          >
            Backend unavailable — chat works with n8n only; messages are not saved.
          </motion.div>
        )}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel rounded-2xl border border-white/10 p-6 text-center text-sm text-slate-400"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                TruthLens Chat
              </p>
              <p>Send a message to start. Replies are powered by your n8n workflow.</p>
            </motion.div>
          )}
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="glass-panel flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100"
          >
            {error}
          </motion.div>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          isLoading={isLoading}
          placeholder="Ask about scientific claims…"
        />
      </div>
    </LayoutShell>
  );
};

export default App;
