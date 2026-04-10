"use client";

import { SimplifiedOutput } from "@/lib/schemas";
import StepsSection from "./StepsSection";
import DocumentsSection from "./DocumentsSection";
import AuthorityCard from "./AuthorityCard";
import WarningsSection from "./WarningsSection";
import ChatAssistant from "./ChatAssistant";
import VisualGuide from "./VisualGuide";
import LinksSection from "./LinksSection";
import VoiceGuide from "./VoiceGuide";

interface Props {
  data: SimplifiedOutput;
  originalText: string;
  onReset: () => void;
}

function getVisualGuide(data: SimplifiedOutput): string[] {
  if (data.visualGuide && data.visualGuide.length > 0) return data.visualGuide;

  if (!data.steps || data.steps.length === 0) return [];

  return data.steps.slice(0, 6).map((step) => {
    const emoji = step.icon?.trim() || "🔹";
    const text = step.title || step.description || "Follow the next step.";
    return `${emoji} ${text}`;
  });
}

export default function SimplifiedView({ data, originalText, onReset }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Simplified Result</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          ← Analyze New Document
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.estimatedTime && <StatCard icon="⏱️" label="Time Required" value={data.estimatedTime} />}
        {data.fees && <StatCard icon="💰" label="Fees" value={data.fees} />}
        <StatCard icon="📋" label="Total Steps" value={`${data.steps.length} steps`} />
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h2 className="font-semibold text-blue-800 mb-2">📌 Summary</h2>
        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
      </div>

      {/* Visual Guide */}
      {getVisualGuide(data).length > 0 && (
        <VisualGuide steps={getVisualGuide(data)} />
      )}

      {/* Simplified Text */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-3">📄 Simplified Explanation</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{data.simplifiedText}</p>
      </div>

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <WarningsSection warnings={data.warnings} />
      )}

      {/* Steps */}
      <StepsSection steps={data.steps} />

      {/* Documents */}
      <DocumentsSection documents={data.requiredDocuments} />

      {/* Forms & Portals */}
      <LinksSection formLinks={data.formLinks} portalLinks={data.portalLinks} />

      {/* Voice Guidance */}
      <VoiceGuide data={data} />

      {/* Authority */}
      <AuthorityCard authority={data.authority} />

      {/* Chat Assistant */}
      <ChatAssistant originalText={originalText} simplifiedOutput={data} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800 text-sm">{value}</p>
      </div>
    </div>
  );
}