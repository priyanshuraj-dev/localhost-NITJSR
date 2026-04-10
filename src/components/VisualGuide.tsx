"use client";

interface Props {
  steps: string[];
}

export default function VisualGuide({ steps }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h2 className="font-semibold text-gray-800 mb-4">🗺️ Visual Process Guide</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            {/* Step bubble */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-gray-700 text-center max-w-[160px]">
              {step}
            </div>
            {/* Arrow - not after last */}
            {i < steps.length - 1 && (
              <span className="text-blue-400 text-xl hidden sm:block">→</span>
            )}
            {i < steps.length - 1 && (
              <span className="text-blue-400 text-xl block sm:hidden">↓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}