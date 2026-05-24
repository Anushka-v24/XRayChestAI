"use client";

import React, { useState } from "react";
import MedicalResult from "../ui/chatbot/MedicalResult";

export default function Page() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const sendQuery = async () => {
    // temporary mock – connect with your API later
    setResult(input); 
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Medical AI Chatbot
      </h1>

      {/* Input Box */}
      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 p-3 border border-gray-300 rounded-xl"
          placeholder="Ask about symptoms, findings, mass, tumor, etc..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={sendQuery}
          className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Ask AI
        </button>
      </div>

      {/* AI Output */}
      {result && <MedicalResult content={result} />}
    </div>
  );
}
// Shows a medical chatbot UI
// ✔ Has an input box
// ✔ Uses useState to store what's typed
// ✔ Uses a button to send the query
// ✔ Shows the result below
// ✔ Currently uses a mock response (input → result)
// ✔ Will later be connected to your AI backend