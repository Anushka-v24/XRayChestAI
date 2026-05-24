"use client";

import React from "react";

interface Props {
  content: string;
}

export default function MedicalResult({ content }: Props) {
  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200">

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        AI Medical Summary
      </h2>

      <div className="prose prose-gray max-w-none">

        {content.split("\n").map((line, idx) => {
          // Headings starting with **
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <h3 key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-2">
                {line.replace(/\*/g, "")}
              </h3>
            );
          }

          // Bullet points
          if (line.trim().startsWith("* ")) {
            return (
              <li key={idx} className="ml-6 text-gray-700 leading-relaxed">
                {line.replace("* ", "")}
              </li>
            );
          }

          // Default paragraph
          return (
            <p key={idx} className="text-gray-700 leading-relaxed mb-3">
              {line}
            </p>
          );
        })}

      </div>
    </div>
  );
}
