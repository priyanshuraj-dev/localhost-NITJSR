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
    <div className="bg-white border rounded-3xl p-6 shadow-sm" style={{ borderColor: "#F0EBE5" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-3xl grid place-items-center text-2xl" style={{ background: "#2C2420", color: "#FAF7F4" }}>🗺️</div>
        <div>
          <h2 className="font-semibold text-xl" style={{ color: "#2C2420" }}>Visual Process Guide</h2>
          <p className="text-sm" style={{ color: "#A89888" }}>Step-by-step process cards to help you follow along visually.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => {
          const { icon, text } = parseStep(step);
          return (
            <div key={i} className="group relative overflow-hidden rounded-[28px] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ border: "1px solid #F0EBE5", background: "#FAF7F4" }}>
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(to right, #E8B4A0, #D4C4B0)" }} />
              <div className="relative flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl text-3xl shadow-sm" style={{ background: "#2C2420" }}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#A89888" }}>Step {i + 1}</p>
                  <p className="mt-2 text-sm leading-6" style={{ color: "#4A3C34" }}>{text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}