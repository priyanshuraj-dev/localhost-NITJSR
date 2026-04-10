"use client";

export default function WarningsSection({ warnings }: { warnings: string[] }) {
  if (!warnings || warnings.length === 0) return null;
  return (
    <div className="result-card" style={{ padding: "28px", background: "#FFFBEB", border: "1px solid #F0E0B0" }}>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#A07040", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
        ⚠ Important Notices
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {warnings.map((w, i) => (
          <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ color: "#E8A040", flexShrink: 0, marginTop: "2px", fontSize: "14px" }}>▲</span>
            <p style={{ fontSize: "14px", color: "#6B5040", lineHeight: 1.65 }}>{w}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
