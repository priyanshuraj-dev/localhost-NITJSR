"use client";

import { useRef, useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { SimplifiedOutput } from "@/lib/schemas";

const SUGGESTIONS = [
  "What if I don't have Aadhaar?",
  "How long does this process take?",
  "Can I apply online?",
  "What happens if documents are rejected?",
];

export default function ChatAssistant({ originalText, simplifiedOutput }: { originalText: string; simplifiedOutput: SimplifiedOutput }) {
  const { messages, loading, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const q = input;
    setInput("");
    await sendMessage(q, originalText, simplifiedOutput);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-semibold text-gray-800">Ask AI Assistant</span>
          {messages.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{messages.length} messages</span>
          )}
        </div>
        <span className="text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100">
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm pt-4">
                <p>Ask anything about this document or process; the assistant will use the loaded context.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s, originalText, simplifiedOutput)}
                      className="text-xs bg-white border border-blue-200 text-blue-600 rounded-full px-3 py-1 hover:bg-blue-50 transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs sm:max-w-sm rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-none px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {error && <p className="text-center text-red-500 text-xs">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question about this procedure or document..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button onClick={handleSend} disabled={!input.trim() || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
              Send
            </button>
            {messages.length > 0 && (
              <button onClick={clearChat} className="text-xs text-gray-400 hover:text-gray-600 px-2">✕</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}