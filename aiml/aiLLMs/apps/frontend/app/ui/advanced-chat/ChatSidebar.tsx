"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ChatSidebar() {
  const [chats] = useState<string[]>([
    "What does my CT show?",
    "Explain pneumonia in simple terms",
    "Summarize my uploaded scan",
  ]);

  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border-r border-white/20 p-4 hidden md:flex flex-col"
    >
      <h2 className="text-lg font-semibold mb-4">Chats</h2>

      <button className="mb-4 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-3">
        {chats.map((c, index) => (
          <div
            key={index}
            className="p-3 bg-white/70 dark:bg-slate-700/60 rounded-xl shadow hover:bg-white/90 cursor-pointer"
          >
            {c}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2 text-sm">Quick Prompts</h3>

        <div className="space-y-2 text-sm">
          <button className="w-full p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200">
            Summarize this X-ray
          </button>

          <button className="w-full p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200">
            Is this pneumonia?
          </button>

          <button className="w-full p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200">
            Compare with previous scan
          </button>
        </div>
      </div>
    </motion.div>
  );
}
