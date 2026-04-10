"use client";

import { useState, useEffect, useRef } from "react";
import { SimplifiedOutput } from "@/lib/schemas";

interface Props {
  data: SimplifiedOutput;
}

export default function VoiceGuide({ data }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
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

  const playAll = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const lines = buildScript();
    let index = 0;

    const speakNext = () => {
      if (index >= lines.length) {
        setIsPlaying(false);
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
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    setIsPlaying(true);
    speakNext();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentLine(-1);
  };

  const speakSingle = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLangCode();
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
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
        {!isPlaying ? (
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
            ⏹ Stop
          </button>
        )}
        <button
          onClick={() => speakSingle(data.summary)}
          className="text-sm"
          style={{ padding: "8px 18px", border: "1.5px solid #E8E0D4", borderRadius: "100px", color: "#6B5E56", background: "transparent", cursor: "pointer" }}
        >
          🔈 Read Summary
        </button>
      </div>

      {/* Steps with individual speak buttons */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#A89888" }}>
          Speak individual steps:
        </p>
        {data.steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg border transition"
            style={{
              borderColor: currentLine !== -1 && isPlaying && i === Math.max(0, currentLine - 2) ? "#E8B4A0" : "#F0EBE5",
              background: currentLine !== -1 && isPlaying && i === Math.max(0, currentLine - 2) ? "#FFF8F5" : "transparent",
            }}
          >
            <span className="text-lg">{step.icon || "📌"}</span>
            <span className="flex-1 text-sm" style={{ color: "#4A3C34" }}>
              Step {step.stepNumber}: {step.title}
            </span>
            <button
              onClick={() => speakSingle(`Step ${step.stepNumber}: ${step.title}. ${step.description}`)}
              className="text-xs px-2 py-1 rounded transition"
              style={{ background: "#F0EBE5", color: "#6B5E56", border: "none", cursor: "pointer" }}
            >
              🔊
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}