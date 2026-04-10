"use client";

import { Step } from "@/lib/schemas";
import { useState } from "react";

export default function StepsSection({ steps }: { steps: Step[] }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(stepNumber) ? next.delete(stepNumber) : next.add(stepNumber);
      return next;
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold" style={{ color: "#2C2420" }}>🪜 Step-by-Step Process</h2>
        <span className="text-xs" style={{ color: "#A89888" }}>{completedSteps.size}/{steps.length} completed</span>
      </div>

      <div className="w-full h-2 rounded-full mb-5" style={{ background: "#F0EBE5" }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${(completedSteps.size / steps.length) * 100}%`, background: "#E8B4A0" }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const isDone = completedSteps.has(step.stepNumber);
          return (
            <div
              key={step.stepNumber}
              onClick={() => toggleStep(step.stepNumber)}
              className="flex gap-4 p-4 rounded-lg border cursor-pointer transition-all"
              style={{
                borderColor: isDone ? "#D4C4B0" : "#F0EBE5",
                background: isDone ? "#FFF8F5" : "#FAFAF8",
              }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: isDone ? "#E8B4A0" : "#F0EBE5",
                  color: isDone ? "#2C2420" : "#6B5E56",
                }}>
                {isDone ? "✓" : step.stepNumber}
              </div>
              <div className="flex-1">
                <h3 className="font-medium" style={{ color: isDone ? "#A89888" : "#2C2420", textDecoration: isDone ? "line-through" : "none" }}>
                  {step.title}
                </h3>
                <p className="text-sm mt-1" style={{ color: "#6B5E56" }}>{step.description}</p>
                {step.tip && (
                  <p className="text-xs rounded px-2 py-1 mt-2 inline-block" style={{ color: "#A07040", background: "#FFFBEB", border: "1px solid #F0E0B0" }}>
                    💡 Tip: {step.tip}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}