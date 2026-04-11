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
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #F0EBE5",
      borderRadius: "20px",
      overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 2px 12px rgba(44,36,32,0.06)",
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", background: "none", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "13px",
            background: "#2C2420",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
          }}>
            💬
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#2C2420", margin: 0 }}>Ask AI Assistant</p>
            <p style={{ fontSize: "12px", color: "#A89888", margin: 0, marginTop: "2px" }}>
              {messages.length > 0 ? `${messages.length} message${messages.length > 1 ? "s" : ""}` : "Ask anything about this procedure"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {messages.length > 0 && (
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "3px 10px",
              borderRadius: "100px", background: "#F0EBE5", color: "#6B5E56",
            }}>
              {messages.length}
            </span>
          )}
          <span style={{
            fontSize: "11px", color: "#A89888",
            transition: "transform 0.25s",
            display: "inline-block",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}>▼</span>
        </div>
      </button>

      {isOpen && (
        <div style={{ borderTop: "1px solid #F0EBE5" }}>
          {/* Messages area */}
          <div style={{
            height: "340px", overflowY: "auto", padding: "20px 24px",
            display: "flex", flexDirection: "column", gap: "14px",
            background: "#FAF7F4",
          }}>
            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: "20px" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🤖</div>
                <p style={{ fontSize: "14px", color: "#6B5E56", marginBottom: "6px", fontWeight: 500 }}>
                  Hi! I have full context of this document.
                </p>
                <p style={{ fontSize: "12px", color: "#A89888", marginBottom: "20px", lineHeight: 1.6 }}>
                  Ask me anything about the procedure, requirements, or next steps.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s, originalText, simplifiedOutput)}
                      style={{
                        padding: "7px 14px", borderRadius: "100px",
                        border: "1.5px solid #E8E0D4", background: "#FFFFFF",
                        color: "#6B5E56", fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8B4A0";
                        (e.currentTarget as HTMLButtonElement).style.color = "#2C2420";
                        (e.currentTarget as HTMLButtonElement).style.background = "#FFF8F5";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E0D4";
                        (e.currentTarget as HTMLButtonElement).style.color = "#6B5E56";
                        (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                    background: "#2C2420", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "13px", marginBottom: "2px",
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "72%", padding: "11px 15px", borderRadius: "16px",
                  borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                  borderBottomLeftRadius: msg.role === "user" ? "16px" : "4px",
                  background: msg.role === "user" ? "#2C2420" : "#FFFFFF",
                  color: msg.role === "user" ? "#FAF7F4" : "#2C2420",
                  border: msg.role === "user" ? "none" : "1px solid #F0EBE5",
                  fontSize: "13px", lineHeight: 1.65,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: msg.role === "assistant" ? "0 1px 4px rgba(44,36,32,0.06)" : "none",
                }}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                    background: "#E8B4A0", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px", fontWeight: 700,
                    color: "#2C2420", marginBottom: "2px",
                  }}>U</div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", gap: "8px", alignItems: "flex-end" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "8px", flexShrink: 0,
                  background: "#2C2420", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "13px",
                }}>🤖</div>
                <div style={{
                  padding: "12px 16px", borderRadius: "16px", borderBottomLeftRadius: "4px",
                  background: "#FFFFFF", border: "1px solid #F0EBE5",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {[0, 150, 300].map(delay => (
                    <span key={delay} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      background: "#E8B4A0", display: "inline-block",
                      animation: `bounce 1s ${delay}ms ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p style={{ textAlign: "center", fontSize: "12px", color: "#C0504A", padding: "8px 16px", background: "#FFF0EE", borderRadius: "8px", border: "1px solid #F0C8C0" }}>
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: "14px 20px", background: "#FFFFFF",
            borderTop: "1px solid #F0EBE5",
            display: "flex", gap: "10px", alignItems: "center",
          }}>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  background: "none", border: "1.5px solid #F0EBE5", cursor: "pointer",
                  color: "#A89888", fontSize: "13px", padding: "8px 10px",
                  borderRadius: "100px", transition: "all 0.2s", flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8B4A0"; (e.currentTarget as HTMLButtonElement).style.color = "#6B5E56"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#F0EBE5"; (e.currentTarget as HTMLButtonElement).style.color = "#A89888"; }}
              >
                ✕
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask about this procedure…"
              style={{
                flex: 1, padding: "10px 18px", borderRadius: "100px",
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
                background: input.trim() && !loading ? "#2C2420" : "#F0EBE5",
                color: input.trim() && !loading ? "#FAF7F4" : "#A89888",
                border: "none",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px",
                transition: "all 0.2s", flexShrink: 0,
              }}
            >
              Send ↑
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
