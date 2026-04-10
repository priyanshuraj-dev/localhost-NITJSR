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

export default function ChatAssistant({
  originalText,
  simplifiedOutput,
}: {
  originalText: string;
  simplifiedOutput: SimplifiedOutput;
}) {
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
    <div className="result-card" style={{ overflow: "hidden" }}>
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 28px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#F5EBFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
            💬
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#2C2420" }}>Ask AI Assistant</p>
            <p style={{ fontSize: "12px", color: "#A89888" }}>
              {messages.length > 0 ? `${messages.length} message${messages.length > 1 ? "s" : ""}` : "Ask anything about this procedure"}
            </p>
          </div>
        </div>
        <span style={{ fontSize: "12px", color: "#A89888", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {isOpen && (
        <div style={{ borderTop: "1px solid #F0EBE5" }}>
          {/* Messages */}
          <div style={{ height: "280px", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", background: "#FAF7F4" }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "16px" }}>
                <p style={{ fontSize: "13px", color: "#A89888", marginBottom: "16px", lineHeight: 1.6 }}>
                  Ask anything about this document or procedure — the assistant has full context.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s, originalText, simplifiedOutput)}
                      style={{
                        padding: "6px 14px", borderRadius: "100px",
                        border: "1.5px solid #E8E0D4", background: "white",
                        color: "#6B5E56", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8B4A0"; (e.currentTarget as HTMLButtonElement).style.color = "#2C2420"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E0D4"; (e.currentTarget as HTMLButtonElement).style.color = "#6B5E56"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "75%", padding: "10px 14px", borderRadius: "14px",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "14px",
                  borderBottomLeftRadius: msg.role === "user" ? "14px" : "4px",
                  background: msg.role === "user" ? "#2C2420" : "white",
                  color: msg.role === "user" ? "#FAF7F4" : "#2C2420",
                  border: msg.role === "user" ? "none" : "1px solid #F0EBE5",
                  fontSize: "13px", lineHeight: 1.65,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 16px", borderRadius: "14px", borderBottomLeftRadius: "4px", background: "white", border: "1px solid #F0EBE5", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D4C4B0", display: "inline-block", animation: `pulse 1s ${delay}ms ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ textAlign: "center", fontSize: "12px", color: "#A04040" }}>{error}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "16px 20px", background: "white", borderTop: "1px solid #F0EBE5", display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask about this procedure…"
              style={{
                flex: 1, padding: "10px 16px", borderRadius: "100px",
                border: "1.5px solid #E8E0D4", background: "#FAF7F4",
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#2C2420",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#E8B4A0")}
              onBlur={e => (e.target.style.borderColor = "#E8E0D4")}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                padding: "10px 20px", borderRadius: "100px",
                background: "#2C2420", color: "#FAF7F4",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px",
                opacity: input.trim() && !loading ? 1 : 0.4, transition: "opacity 0.2s",
              }}
            >
              Send
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#A89888", fontSize: "16px", padding: "4px", borderRadius: "6px" }}
                title="Clear chat"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
