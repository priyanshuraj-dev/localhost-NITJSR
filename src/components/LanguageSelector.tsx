"use client";

import { LANGUAGES } from "@/lib/prompts";

interface Props {
  current: string;
  onChange: (lang: string) => void;
  loading?: boolean;
}

export default function LanguageSelector({ current, onChange, loading }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500">🌐 Language:</span>
      {Object.entries(LANGUAGES).map(([code, name]) => (
        <button
          key={code}
          onClick={() => onChange(code)}
          disabled={loading}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            current === code
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {name.split(" ")[0]}
        </button>
      ))}
    </div>
  );
}