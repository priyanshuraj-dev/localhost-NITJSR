"use client";

import { useEffect, useState } from "react";
import { SimplifiedOutput } from "@/lib/schemas";
import SimplifiedView from "@/components/SimplifiedView";

interface HistoryItem {
  _id: string;
  nameDoc: string;
  uploadUrl: string;
  outputUrl: string;
  language: string;
  createdAt: string;
  simplifiedOutput: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

const LANG_LABELS: Record<string, string> = {
  en: "English", hi: "Hindi", bn: "Bengali", te: "Telugu",
  mr: "Marathi", ta: "Tamil", gu: "Gujarati", kn: "Kannada", pa: "Punjabi",
};

const LANG_COLORS: Record<string, { bg: string; text: string }> = {
  en: { bg: "#EBF0FF", text: "#4060A0" },
  hi: { bg: "#FFF0EB", text: "#A06040" },
  bn: { bg: "#EBF5EB", text: "#4A8A4A" },
  te: { bg: "#F5EBFF", text: "#7040A0" },
  mr: { bg: "#FFFBEB", text: "#A07040" },
  ta: { bg: "#FFEBF0", text: "#A04060" },
  gu: { bg: "#EBF5FF", text: "#4070A0" },
  kn: { bg: "#FFF5EB", text: "#A06020" },
  pa: { bg: "#EBFFF5", text: "#208A60" },
};

function groupByDate(items: HistoryItem[]) {
  const map = new Map<string, HistoryItem[]>();
  items.forEach(item => {
    const diffDays = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 86400000);
    const label =
      diffDays === 0 ? "Today" :
      diffDays === 1 ? "Yesterday" :
      diffDays < 7  ? "This Week" :
      diffDays < 30 ? "This Month" :
      new Date(item.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  });
  const groups: { label: string; items: HistoryItem[] }[] = [];
  map.forEach((items, label) => groups.push({ label, items }));
  return groups;
}

function fileIcon(uploadUrl: string) {
  if (!uploadUrl) return "✏️";
  const u = uploadUrl.toLowerCase();
  if (u.includes("/images/") || u.match(/\.(jpg|jpeg|png|webp)/)) return "🖼️";
  if (u.includes("/pdfs/") || u.match(/\.pdf/)) return "📄";
  if (u.includes("/docx/") || u.match(/\.docx?/)) return "📝";
  if (u.includes("/texts/") || u.match(/\.txt/)) return "📃";
  return "📄";
}

function iconBg(icon: string) {
  if (icon === "🖼️") return "#F0EBFF";
  if (icon === "📃") return "#FFF5F8";
  if (icon === "📝") return "#EBF5EB";
  if (icon === "✏️") return "#FFF0EB";
  return "#EBF0FF";
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<{ data: SimplifiedOutput; item: HistoryItem } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/history")
      .then(r => r.json())
      .then(j => { if (j.success) setItems(j.data); })
      .finally(() => setLoading(false));
  }, []);

  const openItem = (item: HistoryItem) => {
    try {
      const parsed = JSON.parse(item.simplifiedOutput) as SimplifiedOutput;
      setActive({ data: parsed, item });
    } catch { /* ignore */ }
  };

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(i => i._id !== id));
    setDeleting(null);
  };

  const filtered = items.filter(i => i.nameDoc.toLowerCase().includes(search.toLowerCase()));
  const groups = groupByDate(filtered);

  // ── Detail overlay ───────────────────────────────────────────────────────────
  if (active) {
    return (
      <div className="history-overlay" style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        left: "var(--sidebar-w, 260px)",
        zIndex: 49,
        background: "#F8F5F2",
        overflowY: "auto",
        animation: "fadeSlideUp 0.25s ease both",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Sticky top bar — 64px tall */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: "rgba(248,245,242,0.97)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E8E0D8",
          padding: "0 32px", height: "64px", minHeight: "64px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "16px", flexShrink: 0,
        }}>
          <button
            onClick={() => setActive(null)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#2C2420", border: "none", cursor: "pointer",
              fontSize: "13px", fontWeight: 600, color: "#FAF7F4",
              fontFamily: "'DM Sans', sans-serif", padding: "9px 20px",
              borderRadius: "100px", flexShrink: 0,
            }}
          >
            ← History
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <div style={{ textAlign: "right", minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                {active.item.nameDoc}
              </p>
              <p style={{ fontSize: "11px", color: "#A89888", marginTop: "2px" }}>
                {formatDate(active.item.createdAt)}
              </p>
            </div>
            {active.item.uploadUrl && (
              <a href={active.item.uploadUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#A06040", textDecoration: "none", padding: "8px 16px", borderRadius: "100px", background: "#FFF0EB", border: "1px solid #F0D4C4", flexShrink: 0, whiteSpace: "nowrap" }}>
                {fileIcon(active.item.uploadUrl)} Input ↗
              </a>
            )}
            {active.item.outputUrl && (
              <a href={active.item.outputUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#4A8A4A", textDecoration: "none", padding: "8px 16px", borderRadius: "100px", background: "#EBF5EB", border: "1px solid #C8E8C8", flexShrink: 0, whiteSpace: "nowrap" }}>
                📄 Output ↗
              </a>
            )}
          </div>
        </div>

        {/* Content — SimplifiedView renders here, no extra wrapper needed */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <SimplifiedView
            data={active.data}
            originalText=""
            onReset={() => setActive(null)}
          />
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", animation: "fadeSlideUp 0.4s ease both" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "32px" }}>
        <span className="tag-chip" style={{ background: "#EBF0FF", color: "#4060A0", marginBottom: "12px", display: "inline-block" }}>
          ◈ History
        </span>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px,3vw,32px)", color: "#2C2420", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "6px" }}>
              My Analysis History
            </h1>
            <p style={{ fontSize: "14px", color: "#A89888", lineHeight: 1.5 }}>
              {items.length} document{items.length !== 1 ? "s" : ""} analysed — all stored in Cloudinary
            </p>
          </div>

          {items.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              background: "white", border: "1.5px solid #E8E0D4",
              borderRadius: "100px", padding: "10px 20px",
              minWidth: "240px", maxWidth: "280px",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
              onFocusCapture={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#E8B4A0";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 3px rgba(232,180,160,0.15)";
              }}
              onBlurCapture={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#E8E0D4";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "15px", color: "#A89888", flexShrink: 0 }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search documents…"
                style={{ background: "none", border: "none", outline: "none", fontSize: "13px", color: "#2C2420", fontFamily: "'DM Sans', sans-serif", width: "100%", lineHeight: 1.5 }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#A89888", fontSize: "16px", padding: "0 2px", lineHeight: 1, flexShrink: 0 }}>×</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Skeletons ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{
              height: "88px", borderRadius: "18px",
              background: "linear-gradient(90deg, #F5F0EC 25%, #EDE8E2 50%, #F5F0EC 75%)",
              backgroundSize: "200% 100%", animation: "shimmer 1.4s ease infinite",
            }} />
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 32px", background: "white", borderRadius: "24px", border: "1px solid #F0EBE5" }}>
          <div style={{ fontSize: "56px", marginBottom: "20px", lineHeight: 1 }}>📂</div>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#2C2420", marginBottom: "10px", fontFamily: "'Playfair Display', serif" }}>
            No history yet
          </p>
          <p style={{ fontSize: "14px", color: "#A89888", marginBottom: "28px", lineHeight: 1.6 }}>
            Upload a PDF, image, or paste text to analyse a document.
          </p>
          <a href="/dashboard">
            <button className="pill-btn pill-btn-primary" style={{ fontSize: "13px", padding: "11px 26px" }}>
              Upload a Document →
            </button>
          </a>
        </div>
      )}

      {/* ── No search results ── */}
      {!loading && items.length > 0 && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "56px 20px", color: "#A89888" }}>
          <p style={{ fontSize: "36px", marginBottom: "14px", lineHeight: 1 }}>🔍</p>
          <p style={{ fontSize: "14px", lineHeight: 1.6 }}>No documents match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      {/* ── Grouped list ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {groups.map(group => (
            <div key={group.label}>

              {/* Group label */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#A89888", letterSpacing: "0.12em", textTransform: "uppercase", flexShrink: 0 }}>
                  {group.label}
                </p>
                <div style={{ flex: 1, height: "1px", background: "#F0EBE5" }} />
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {group.items.map(item => {
                  let parsed: SimplifiedOutput | null = null;
                  try { parsed = JSON.parse(item.simplifiedOutput); } catch { /* skip */ }
                  const langColor = LANG_COLORS[item.language] ?? { bg: "#F0EBE5", text: "#6B5E56" };
                  const icon = fileIcon(item.uploadUrl);

                  return (
                    <div
                      key={item._id}
                      onClick={() => parsed && openItem(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "18px 20px",
                        borderRadius: "18px",
                        background: "white",
                        border: "1px solid #F0EBE5",
                        cursor: parsed ? "pointer" : "default",
                        transition: "box-shadow 0.2s, border-color 0.2s, transform 0.15s",
                        minHeight: "80px",
                      }}
                      onMouseEnter={e => {
                        if (!parsed) return;
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)";
                        el.style.borderColor = "#E8E0D4";
                        el.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.boxShadow = "none";
                        el.style.borderColor = "#F0EBE5";
                        el.style.transform = "translateY(0)";
                      }}
                    >
                      {/* File type icon */}
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "14px",
                        flexShrink: 0, background: iconBg(icon),
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "22px",
                      }}>
                        {icon}
                      </div>

                      {/* Title + meta — takes all remaining space */}
                      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                        <p style={{
                          fontSize: "14px", fontWeight: 600, color: "#2C2420",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          lineHeight: 1.4,
                        }}>
                          {item.nameDoc}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "#A89888", lineHeight: 1.4 }}>
                            {timeAgo(item.createdAt)}
                          </span>
                          <span style={{ color: "#D4C4B0", fontSize: "10px", lineHeight: 1 }}>•</span>
                          <span style={{
                            fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
                            background: langColor.bg, color: langColor.text,
                            fontWeight: 600, lineHeight: 1.4, whiteSpace: "nowrap",
                          }}>
                            {LANG_LABELS[item.language] || item.language}
                          </span>
                          {parsed && parsed.steps?.length > 0 && (
                            <>
                              <span style={{ color: "#D4C4B0", fontSize: "10px", lineHeight: 1 }}>•</span>
                              <span style={{ fontSize: "12px", color: "#A89888", lineHeight: 1.4, whiteSpace: "nowrap" }}>
                                {parsed.steps.length} steps
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right-side actions — fixed width, never wraps */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                        {item.uploadUrl && (
                          <a
                            href={item.uploadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: "12px", padding: "6px 12px", borderRadius: "10px",
                              background: "#F5F0EC", color: "#6B5E56",
                              textDecoration: "none", fontWeight: 500,
                              whiteSpace: "nowrap", lineHeight: 1.4,
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#EDE8E2")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#F5F0EC")}
                          >
                            Input ↗
                          </a>
                        )}

                        {item.outputUrl && (
                          <a
                            href={item.outputUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: "12px", padding: "6px 12px", borderRadius: "10px",
                              background: "#EBF5EB", color: "#4A8A4A",
                              textDecoration: "none", fontWeight: 500,
                              whiteSpace: "nowrap", lineHeight: 1.4,
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#D8EED8")}
                            onMouseLeave={e => (e.currentTarget.style.background = "#EBF5EB")}
                          >
                            Output ↗
                          </a>
                        )}

                        {parsed && (
                          <span style={{
                            fontSize: "12px", color: "#6B5E56", padding: "6px 12px",
                            borderRadius: "10px", background: "#F5F0EC",
                            fontWeight: 500, whiteSpace: "nowrap", lineHeight: 1.4,
                          }}>
                            View →
                          </span>
                        )}

                        <button
                          onClick={e => deleteItem(item._id, e)}
                          disabled={deleting === item._id}
                          style={{
                            width: "32px", height: "32px", borderRadius: "10px",
                            background: "none", border: "none", cursor: "pointer",
                            color: "#C4B8B0", fontSize: "18px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "color 0.2s, background 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#A04040"; e.currentTarget.style.background = "#FFEBEB"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#C4B8B0"; e.currentTarget.style.background = "none"; }}
                          title="Delete"
                        >
                          {deleting === item._id ? "…" : "×"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
