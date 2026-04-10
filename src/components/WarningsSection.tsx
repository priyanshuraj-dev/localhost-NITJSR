"use client";

export default function WarningsSection({ warnings }: { warnings: string[] }) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
      <h2 className="font-semibold text-amber-800 mb-3">⚠️ Important Warnings</h2>
      <ul className="space-y-2">
        {warnings.map((w, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
            <span className="mt-0.5 flex-shrink-0">•</span>
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}