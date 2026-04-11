"use client";

import { Document } from "@/lib/schemas";
import { useState } from "react";

export default function DocumentsSection({ documents }: { documents: Document[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const required = documents.filter((d) => d.required);
  const optional = documents.filter((d) => !d.required);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">📁 Required Documents</h2>
        <span className="text-xs text-gray-500">{checked.size}/{documents.length} ready</span>
      </div>

      {required.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Mandatory</p>
          <div className="space-y-2">
            {required.map((doc, i) => (
              <DocItem key={i} doc={doc} index={i} checked={checked.has(i)} onToggle={toggle} />
            ))}
          </div>
        </div>
      )}

      {optional.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Optional / Supporting</p>
          <div className="space-y-2">
            {optional.map((doc, i) => {
              const idx = required.length + i;
              return <DocItem key={idx} doc={doc} index={idx} checked={checked.has(idx)} onToggle={toggle} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DocItem({ doc, index, checked, onToggle }: { doc: Document; index: number; checked: boolean; onToggle: (i: number) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-lg border p-3 transition-all ${checked ? "border-green-200 bg-green-50" : "border-gray-100"}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={checked} onChange={() => onToggle(index)} className="mt-1 w-4 h-4 accent-green-500 cursor-pointer" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-medium text-sm ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>
              {doc.name}
              {doc.required && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Required</span>}
            </span>
            <button onClick={() => setExpanded(!expanded)} className="text-xs ml-2" style={{ color: "#E8B4A0", background: "none", border: "none", cursor: "pointer" }}>
              {expanded ? "less" : "more"}
            </button>
          </div>
          {expanded && (
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>{doc.description}</p>
              {doc.alternatives && doc.alternatives.length > 0 && (
                <p className="text-xs text-amber-700">
                  <span className="font-medium">Alternatives: </span>{doc.alternatives.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}