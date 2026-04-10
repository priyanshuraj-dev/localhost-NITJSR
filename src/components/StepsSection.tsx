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
        <h2 className="font-semibold text-gray-800">🪜 Step-by-Step Process</h2>
        <span className="text-xs text-gray-500">{completedSteps.size}/{steps.length} completed</span>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full mb-5">
        <div
          className="h-2 bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const isDone = completedSteps.has(step.stepNumber);
          return (
            <div
              key={step.stepNumber}
              onClick={() => toggleStep(step.stepNumber)}
              className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                isDone ? "border-green-200 bg-green-50" : "border-gray-100 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isDone ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700"
              }`}>
                {isDone ? "✓" : step.stepNumber}
              </div>
              <div className="flex-1">
                <h3 className={`font-medium ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                {step.tip && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2 inline-block">
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