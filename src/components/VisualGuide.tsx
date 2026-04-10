"use client";

interface Props {
  steps: string[];
}

export default function VisualGuide({ steps }: Props) {
  const parseStep = (step: string) => {
    const parts = step.trim().split(" ");
    const firstPart = parts[0] || "";
    const emojiMatch = firstPart.match(/^\p{Extended_Pictographic}/u);
    const icon = emojiMatch ? firstPart : "🔹";
    const text = emojiMatch ? parts.slice(1).join(" ") : step;
    return { icon, text };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-3xl bg-blue-600 text-white grid place-items-center text-2xl">🗺️</div>
        <div>
          <h2 className="font-semibold text-gray-900 text-xl">Visual Process Guide</h2>
          <p className="text-sm text-gray-500">Step-by-step process cards to help you follow along visually.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => {
          const { icon, text } = parseStep(step);
          return (
            <div key={i} className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-slate-200 opacity-80" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600 text-3xl text-white shadow-sm">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Step {i + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}