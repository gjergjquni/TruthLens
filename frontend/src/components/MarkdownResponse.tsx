import { motion } from "framer-motion";
import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownResponseProps {
  markdown: string;
}

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-6 text-xl font-semibold text-slate-50 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-lg font-semibold text-slate-100">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-slate-200">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-3 text-sm leading-relaxed text-slate-200">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-3 ml-5 list-disc space-y-1 text-sm text-slate-200">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm text-slate-200">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-slate-200">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-200">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-primary/50 pl-4 italic text-slate-300">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-white/10" />
};

export const MarkdownResponse: React.FC<MarkdownResponseProps> = ({ markdown }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-3xl p-5 sm:p-6"
    >
      <div className="markdown-response prose prose-invert max-w-none">
        <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
      </div>
    </motion.section>
  );
};
