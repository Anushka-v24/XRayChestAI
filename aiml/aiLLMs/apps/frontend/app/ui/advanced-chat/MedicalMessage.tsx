"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

export default function MedicalMessage({ text }: { text: any }) {
  console.log({text}, "from medical message")
  const isUser = text.role === "user";
 const markdownContent = text.parts
    .filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join("");
  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } transition-all`}
    >
      <div
        className={`max-w-[88%] rounded-lg p-4 shadow-lg whitespace-pre-line sm:max-w-[75%] ${
          isUser
            ? "bg-teal-600 text-white shadow-teal-200"
            : "border border-white bg-white/95 text-slate-900 shadow-slate-200 dark:bg-slate-700/60 dark:text-gray-100 backdrop-blur"
        }`}
      >
    <ReactMarkdown
          components={{
            p: (props) => <p className="mb-2 leading-relaxed" {...props} />,
            strong: (props) => <strong className="font-semibold" {...props} />,
            code: (props) => (
              <code className="bg-gray-200 dark:bg-gray-800 p-1 rounded" {...props} />
            ),
            li: (props) => <li className="ml-4 list-disc" {...props} />,
          }}
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
