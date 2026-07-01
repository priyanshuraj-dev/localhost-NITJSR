"use client";

import { useState, useEffect, useRef } from "react";
import { SimplifiedOutput } from "@/lib/schemas";

interface Props {
  data: SimplifiedOutput;
}

export default function VoiceGuide({ data }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState(-1);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Build the full script to read
  const buildScript = (): string[] => {
    const lines: string[] = [];

    lines.push(`${data.title}.`);
    lines.push(data.summary);

    const visualGuideLines = data.visualGuide && data.visualGuide.length > 0
      ? data.visualGuide
      : data.steps.map((s) => `${s.icon?.trim() || "🔹"} ${s.title}`);

    if (visualGuideLines.length > 0) {
      lines.push("Here is a quick overview of the process.");
      visualGuideLines.forEach((g) => lines.push(g));
    }

    lines.push(`There are ${data.steps.length} steps in total.`);
    data.steps.forEach((s) => {
      lines.push(`Step ${s.stepNumber}: ${s.title}. ${s.description}`);
      if (s.tip) lines.push(`Tip: ${s.tip}`);
    });

    lines.push(`You will need ${data.requiredDocuments.length} documents.`);
    data.requiredDocuments.forEach((d) => {
      lines.push(`${d.name}. ${d.description}`);
    });

    if (data.warnings && data.warnings.length > 0) {
      lines.push("Important warnings:");
      data.warnings.forEach((w) => lines.push(w));
    }

    if (data.fees) lines.push(`Fee: ${data.fees}`);
    if (data.estimatedTime) lines.push(`Estimated time: ${data.estimatedTime}`);

    return lines;
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    // Fire this once to wake up the voices array in some browsers
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Detect language for voice
  const getLangCode = () => {
    const map: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      bn: "bn-IN",
      te: "te-IN",
      mr: "mr-IN",
      ta: "ta-IN",
      gu: "gu-IN",
      kn: "kn-IN",
      pa: "pa-IN",
      English: "en-IN",
      Hindi: "hi-IN",
      বাংলা: "bn-IN",
      తెలుగు: "te-IN",
      मराठी: "mr-IN",
      தமிழ்: "ta-IN",
      ગુજરાતી: "gu-IN",
      ಕನ್ನಡ: "kn-IN",
      ਪੰਜਾਬੀ: "pa-IN",
    };
    return map[data.language] || "en-IN";
  };

  // Stop function with callback cleanup
  const stop = () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();
    setPlayingId(null);
    setCurrentLine(-1);
  };

  const playAll = () => {
    if (!supported) return;
    stop(); 
    
    // THE FIX: 50ms delay to prevent the browser's cancel/speak race condition bug
    setTimeout(() => {
      const lines = buildScript();
      let index = 0;

      const speakNext = () => {
        if (index >= lines.length) {
          setPlayingId(null);
          setCurrentLine(-1);
          return;
        }
        setCurrentLine(index);
        const utterance = new SpeechSynthesisUtterance(lines[index]);
        utterance.lang = getLangCode();
        utterance.rate = 0.9;
        
        utterance.onend = () => {
          index++;
          speakNext();
        };
        utterance.onerror = (e) => {
          console.error("TTS Error:", e);
          setPlayingId(null);
          setCurrentLine(-1);
        };
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      setPlayingId("all");
      speakNext();
    }, 50);
  };

  const speakSingle = (text: string, id: string) => {
    stop(); 
    
    // THE FIX: 50ms delay here as well
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLangCode();
      utterance.rate = 0.9;
      
      utterance.onend = () => {
        setPlayingId(null);
      };
      utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        setPlayingId(null);
      };
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setPlayingId(id);
    }, 50);
  };

  if (!supported) return null;

  return (
    <div className="bg-white border rounded-xl p-5" style={{ borderColor: "#F0EBE5" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold" style={{ color: "#2C2420" }}>🔊 Voice Guidance</h2>
        <span className="text-xs" style={{ color: "#A89888" }}>Powered by Browser TTS</span>
      </div>

      {/* Main Controls */}
      <div className="flex gap-3 mb-5">
        {playingId !== "all" ? (
          <button
            onClick={playAll}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ padding: "8px 18px", background: "#2C2420", color: "#FAF7F4", border: "none", borderRadius: "100px", cursor: "pointer" }}
          >
            ▶ Read Full Guide
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ padding: "8px 18px", background: "#C0504A", color: "white", border: "none", borderRadius: "100px", cursor: "pointer" }}
          >
            ⏹ Stop Guide
          </button>
        )}

        {playingId !== "summary" ? (
          <button
            onClick={() => speakSingle(data.summary, "summary")}
            className="text-sm"
            style={{ padding: "8px 18px", border: "1.5px solid #E8E0D4", borderRadius: "100px", color: "#6B5E56", background: "transparent", cursor: "pointer" }}
          >
            🔈 Read Summary
          </button>
        ) : (
          <button
            onClick={stop}
            className="text-sm"
            style={{ padding: "8px 18px", border: "1.5px solid #C0504A", borderRadius: "100px", color: "#C0504A", background: "#FFF0F0", cursor: "pointer" }}
          >
            ⏹ Stop Summary
          </button>
        )}
      </div>

      {/* Steps with individual speak/stop buttons */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#A89888" }}>
          Speak individual steps:
        </p>
        {data.steps.map((step, i) => {
          const stepId = `step-${i}`;
          const isActive = playingId === stepId || (playingId === "all" && currentLine !== -1 && i === Math.max(0, currentLine - 2));

          return (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border transition"
              style={{
                borderColor: isActive ? "#E8B4A0" : "#F0EBE5",
                background: isActive ? "#FFF8F5" : "transparent",
              }}
            >
              <span className="text-lg">{step.icon || "📌"}</span>
              <span className="flex-1 text-sm" style={{ color: "#4A3C34" }}>
                Step {step.stepNumber}: {step.title}
              </span>
              <button
                onClick={() =>
                  playingId === stepId
                    ? stop()
                    : speakSingle(`Step ${step.stepNumber}: ${step.title}. ${step.description}`, stepId)
                }
                className="text-xs px-2 py-1 rounded transition"
                style={{
                  background: playingId === stepId ? "#C0504A" : "#F0EBE5",
                  color: playingId === stepId ? "white" : "#6B5E56",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {playingId === stepId ? "⏹" : "🔊"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}