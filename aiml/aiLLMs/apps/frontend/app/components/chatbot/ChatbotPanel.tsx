"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
export function ChatBotPanel() {
  const [input, setInput] = useState("");

  let transport = new DefaultChatTransport({
    api: "/api/agentD",
    body: {
      userId: "23140e89-eeaa-42e2-82f9-d35cc874357a",
    },
  });

  const { messages: aiMessages, sendMessage: sendAiMessage } = useChat({
    transport,
  });
  const send = () => {
    if (!input.trim()) return;
    sendAiMessage({
      role: "user",
      parts: [{ type: "text", text: input }],
    });
    setInput("");
  };
  console.log({aiMessages})
  return (
    <div className="flex flex-col flex-1 p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {aiMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-xs ${
              msg.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {msg.role === "user" ? "You: " : "Model : "}{" "}
            {msg.parts.map((part, index) => {
              if (part.type === "text") {
                return <span key={`${msg.id}-text-${index}`}>{part.text}</span>;
              }
              return null;
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value as string)
          }
          placeholder="Ask AI assistant..."
        />
        <Button onClick={send} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
