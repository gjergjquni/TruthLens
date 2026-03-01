import { motion } from "framer-motion";
import React from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = "Type your message…"
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim().length > 0) onSubmit();
    }
  };
  return (
    <div className="glass-panel flex w-full flex-col gap-2 rounded-2xl border border-white/10 p-3 sm:p-4">
      <textarea
        className="min-h-[44px] w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        rows={1}
      />
      <div className="flex justify-end">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || value.trim().length === 0}
          whileHover={isLoading ? undefined : { scale: 1.02 }}
          whileTap={isLoading ? undefined : { scale: 0.98 }}
          className="primary-btn rounded-xl px-5 py-2 text-sm"
        >
          {isLoading ? "Sending…" : "Send"}
        </motion.button>
      </div>
    </div>
  );
};
