"use client";

import React, { useRef, useEffect, useState } from "react";
import MedicalMessage from "./MedicalMessage";
import Loader from "./Loader";
import { motion } from "framer-motion";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { MessageSquareText, Send, Sparkles } from "lucide-react";

export default function MedicalChat({ id = "" }: { id?: string }) {
  const [input, setInput] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const transport = React.useMemo(() => {
    console.log("Creating transport for user:", id);
    return new DefaultChatTransport({
      api: "/api/agentD",
      body: { userId: id },
    });
  }, [id]);

  const { messages: aiMessages, sendMessage: sendAiMessage, status } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [aiMessages]);

  function sendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const messageToSend = input;
    console.log("Sending message:", messageToSend);
    setInput("");

    // v5: sendMessage({ text })
    sendAiMessage({ text: messageToSend });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* CHAT WINDOW */}
      {aiMessages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-teal-200 bg-white/55 p-6 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-600 text-white shadow-lg shadow-teal-200">
              <MessageSquareText size={22} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              Ask about the latest report
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              The assistant can explain findings, likely conditions, differentials, and next steps from the most recent upload.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 overflow-y-auto space-y-4 rounded-lg border border-white/70 bg-white/65 p-4 shadow-inner shadow-slate-100 backdrop-blur-xl sm:p-6"
        >
          {aiMessages.map((m, i) => (
            <MedicalMessage key={i} text={m} />
          ))}

          {isLoading && <Loader />}
        </motion.div>
      )}

      {/* INPUT BAR */}
      <form
        onSubmit={sendMessage}
        className="mt-4 flex items-center gap-3 rounded-lg border border-white/80 bg-white/80 p-2 shadow-lg shadow-slate-200/70"
      >
        <label className="rounded-lg border border-cyan-100 bg-cyan-50 p-3 text-cyan-700 shadow-sm">
          <Sparkles size={18} />
        </label>

        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-3 text-slate-900 shadow-sm transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          placeholder="Ask something medical..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  );
}
