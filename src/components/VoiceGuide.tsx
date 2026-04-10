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

    if (data.visualGuide && data.visualGuide.length > 0) {
      lines.push("Here is a quick overview of the process.");
      data.visualGuide.forEach((g) => lines.push(g));
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
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">🔊 Voice Guidance</h2>
        <span className="text-xs text-gray-400">Powered by Browser TTS</span>
      </div>

      {/* Main Controls */}
      <div className="flex gap-3 mb-5">
        {!isPlaying ? (
          <button
            onClick={playAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            ▶ Read Full Guide
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
          >
            ⏹ Stop
          </button>
        )}
        <button
          onClick={() => speakSingle(data.summary)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          🔈 Read Summary
        </button>
      </div>

      {/* Steps with individual speak buttons */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          Speak individual steps:
        </p>
        {data.steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
              currentLine !== -1 && isPlaying && i === Math.max(0, currentLine - 2)
                ? "border-blue-300 bg-blue-50"
                : "border-gray-100"
            }`}
          >
            <span className="text-lg">{step.icon || "📌"}</span>
            <span className="flex-1 text-sm text-gray-700">
              Step {step.stepNumber}: {step.title}
            </span>
            <button
              onClick={() =>
                speakSingle(`Step ${step.stepNumber}: ${step.title}. ${step.description}`)
              }
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-blue-100 hover:text-blue-700 transition"
            >
              🔊
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}