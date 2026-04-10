"use client";

import { useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  typeLabel: string;
  typeColor: string;
  cloudinaryUrl?: string;
  status: "uploading" | "done" | "error";
}

interface RecentDoc {
  id: string;
  title: string;
  type: string;
  typeColor: string;
  date: string;
  status: "done" | "processing";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FILE_TYPES = [
  { id: "pdf", icon: "📄", label: "PDF", accept: ".pdf", color: "#FFF0EB", border: "#F0D4C4" },
  { id: "image", icon: "🖼️", label: "Image", accept: "image/*", color: "#EBF0FF", border: "#C4D4F0" },
  { id: "docx", icon: "📝", label: "Word Doc", accept: ".docx,.doc", color: "#EBF5EB", border: "#C4E0C4" },
  { id: "txt", icon: "📃", label: "Text", accept: ".txt", color: "#F5EBFF", border: "#D4C4F0" },
];

const RECENT_DOCS: RecentDoc[] = [
  { id: "1", title: "RTI Application Form", type: "PDF", typeColor: "#FFF0EB", date: "Today, 2:30 PM", status: "done" },
  { id: "2", title: "Land Record Notice", type: "Image", typeColor: "#EBF0FF", date: "Yesterday", status: "done" },
  { id: "3", title: "GST Registration Letter", type: "PDF", typeColor: "#FFF0EB", date: "Apr 8", status: "processing" },
];

const STATS = [
  { label: "Documents Uploaded", value: "12", icon: "⬡", color: "#FFF0EB" },
  { label: "Procedures Decoded", value: "9", icon: "◎", color: "#EBF5EB" },
  { label: "Languages Used", value: "3", icon: "◈", color: "#EBF0FF" },
  { label: "Time Saved (hrs)", value: "4.5", icon: "◇", color: "#F5EBFF" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getFileTypeInfo(file: File) {
  const mime = file.type;
  if (mime === "application/pdf") return { typeLabel: "PDF", typeColor: "#FFF0EB" };
  if (mime.startsWith("image/")) return { typeLabel: "Image", typeColor: "#EBF0FF" };
  if (mime === "text/plain") return { typeLabel: "Text", typeColor: "#F5EBFF" };
  if (mime.includes("wordprocessingml") || mime.includes("msword")) return { typeLabel: "Word", typeColor: "#EBF5EB" };
  return { typeLabel: "File", typeColor: "#F5F0EC" };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedLang, setSelectedLang] = useState("English");
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedType = FILE_TYPES.find((t) => t.id === selectedTypeId);

  const handleFiles = useCallback(async (rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles);
    if (!arr.length) return;

    setUploadState("uploading");

    const newFiles: UploadedFile[] = arr.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: formatBytes(f.size),
      type: f.type,
      ...getFileTypeInfo(f),
      status: "uploading",
    }));

    setFiles((prev) => [...newFiles, ...prev]);

    // Upload each file to Cloudinary via the API route
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const fileEntry = newFiles[i];

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);

        const res = await fetch("/api/cloudinary/upload", {
          method: "POST",
          // Authorization header — replace with real token from auth context later
          headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
          body: formData,
        });

        const data = await res.json();

        if (data.success && data.uploaded?.[0]) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileEntry.id
                ? { ...f, status: "done", cloudinaryUrl: data.uploaded[0].cloudinaryUrl }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileEntry.id ? { ...f, status: "error" } : f))
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileEntry.id ? { ...f, status: "error" } : f))
        );
      }
    }

    setUploadState("success");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setUploadState("idle");
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (files.length <= 1) setUploadState("idle");
  };

  return (
    <div style={{ animation: "fadeSlideUp 0.5s ease both" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "32px" }}>
        <span
          className="tag-chip"
          style={{ background: "#FFF0EB", color: "#A06040", marginBottom: "12px" }}
        >
          ✦ Upload & Analyse
        </span>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 3vw, 36px)",
            color: "#2C2420",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            marginBottom: "8px",
          }}
        >
          Upload a Government Document
        </h1>
        <p style={{ fontSize: "15px", color: "#6B5E56", lineHeight: 1.6 }}>
          Drop any legal notice, form, or procedure document — get a plain-language guide in seconds.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {STATS.map((s, i) => (
          <div key={i} className="stat-card" style={{ animation: `fadeSlideUp 0.5s ${i * 0.08}s ease both` }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: s.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginBottom: "12px",
              }}
            >
              {s.icon}
            </div>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "#2C2420",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: "4px",
              }}
            >
              {s.value}
            </p>
            <p style={{ fontSize: "12px", color: "#A89888" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

        {/* Left: upload panel */}
        <div className="card" style={{ padding: "32px" }}>

          {/* Input mode toggle */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "#F5F0EC",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "28px",
              width: "fit-content",
            }}
          >
            {(["file", "text"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "9px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  background: inputMode === mode ? "white" : "transparent",
                  color: inputMode === mode ? "#2C2420" : "#A89888",
                  boxShadow: inputMode === mode ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {mode === "file" ? "📎 File Upload" : "✏️ Paste Text"}
              </button>
            ))}
          </div>

          {inputMode === "file" ? (
            <>
              {/* File type selector */}
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                  File type (optional filter)
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  {FILE_TYPES.map((ft) => (
                    <button
                      key={ft.id}
                      className={`file-type-btn ${selectedTypeId === ft.id ? "selected" : ""}`}
                      onClick={() => setSelectedTypeId(selectedTypeId === ft.id ? null : ft.id)}
                      style={{ background: selectedTypeId === ft.id ? ft.color : "white" }}
                    >
                      <span style={{ fontSize: "24px" }}>{ft.icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#2C2420" }}>{ft.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                className={`upload-zone ${uploadState === "dragging" ? "dragging" : ""} ${uploadState === "success" ? "done" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
                onDragLeave={() => setUploadState("idle")}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={selectedType?.accept || ".pdf,.docx,.doc,.txt,image/*"}
                  style={{ display: "none" }}
                  onChange={handleFileInput}
                />

                {uploadState === "idle" && (
                  <>
                    <div style={{ fontSize: "48px", marginBottom: "16px", color: "#D4C4B0" }}>⬡</div>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#2C2420", marginBottom: "8px" }}>
                      Drop your document here
                    </p>
                    <p style={{ fontSize: "13px", color: "#A89888", marginBottom: "20px" }}>
                      PDF, JPG, PNG, DOCX, TXT · Max 20 MB · Multiple files supported
                    </p>
                    <button className="pill-btn pill-btn-primary" style={{ fontSize: "13px", padding: "10px 22px" }}
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      Browse Files
                    </button>
                  </>
                )}

                {uploadState === "dragging" && (
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "#E8B4A0" }}>Release to upload ↑</p>
                )}

                {uploadState === "uploading" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "40px", height: "40px", border: "3px solid #E8E0D4", borderTopColor: "#2C2420", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <p style={{ fontSize: "14px", color: "#6B5E56" }}>Uploading to Cloudinary…</p>
                  </div>
                )}

                {uploadState === "success" && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#A8C5A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white" }}>✓</div>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#2C2420" }}>Upload complete</p>
                    <p style={{ fontSize: "13px", color: "#6B5E56" }}>Files saved to Cloudinary & MongoDB</p>
                    <button className="pill-btn pill-btn-ghost" style={{ fontSize: "12px", padding: "8px 18px", marginTop: "4px" }}
                      onClick={(e) => { e.stopPropagation(); setUploadState("idle"); }}>
                      Upload more
                    </button>
                  </div>
                )}
              </div>

              {/* Uploaded files list */}
              {files.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                    Uploaded files
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {files.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "12px",
                          background: "#FAF7F4",
                          border: "1px solid #F0EBE5",
                        }}
                      >
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: f.typeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                          {f.typeLabel === "PDF" ? "📄" : f.typeLabel === "Image" ? "🖼️" : f.typeLabel === "Word" ? "📝" : "📃"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                          <p style={{ fontSize: "11px", color: "#A89888" }}>{f.size} · {f.typeLabel}</p>
                          {f.cloudinaryUrl && (
                            <a href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "11px", color: "#A06040", textDecoration: "none" }}
                              onClick={(e) => e.stopPropagation()}>
                              View on Cloudinary ↗
                            </a>
                          )}
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {f.status === "uploading" && (
                            <div style={{ width: "18px", height: "18px", border: "2px solid #E8E0D4", borderTopColor: "#2C2420", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                          )}
                          {f.status === "done" && (
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#A8C5A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white" }}>✓</div>
                          )}
                          {f.status === "error" && (
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#F0A0A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white" }}>✕</div>
                          )}
                        </div>
                        <button
                          onClick={() => removeFile(f.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#C4B8B0", fontSize: "16px", padding: "2px", borderRadius: "4px", transition: "color 0.2s", flexShrink: 0 }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#2C2420")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#C4B8B0")}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Text input mode */
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                Paste your document text
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the content of any government notice, legal document, or procedure here…"
                style={{
                  width: "100%",
                  minHeight: "240px",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1.5px solid #E8E0D4",
                  background: "#FAFAFA",
                  fontSize: "14px",
                  color: "#2C2420",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.7,
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#E8B4A0";
                  e.target.style.boxShadow = "0 0 0 3px rgba(232,180,160,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E8E0D4";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                <span style={{ fontSize: "12px", color: "#A89888" }}>{textInput.length} characters</span>
                <button
                  className="pill-btn pill-btn-primary"
                  disabled={!textInput.trim()}
                  style={{ fontSize: "13px", padding: "10px 22px", opacity: textInput.trim() ? 1 : 0.5 }}
                >
                  Analyse Text →
                </button>
              </div>
            </div>
          )}

          {/* Language + submit */}
          <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid #F0EBE5" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
              Output language
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {["English", "हिन्दी", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "ਪੰਜਾਬੀ", "ಕನ್ನಡ"].map((lang) => (
                <button
                  key={lang}
                  className={`lang-badge ${selectedLang === lang ? "selected" : ""}`}
                  onClick={() => setSelectedLang(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              className="pill-btn pill-btn-accent"
              style={{ width: "100%", justifyContent: "center", fontSize: "15px", padding: "14px" }}
              disabled={inputMode === "file" ? files.length === 0 : !textInput.trim()}
            >
              ✦ Generate Plain-Language Guide
            </button>
            <p style={{ fontSize: "12px", color: "#A89888", textAlign: "center", marginTop: "10px" }}>
              AI analysis · Results in ~30 seconds
            </p>
          </div>
        </div>

        {/* Right: sidebar panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* How it works */}
          <div className="card" style={{ padding: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
              How it works
            </p>
            {[
              { step: "01", label: "Upload your document", color: "#FFF0EB" },
              { step: "02", label: "AI reads & identifies the procedure", color: "#EBF5EB" },
              { step: "03", label: "Get a step-by-step guide", color: "#EBF0FF" },
              { step: "04", label: "Follow in your language", color: "#F5EBFF" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: i < 3 ? "12px" : 0 }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#2C2420", flexShrink: 0 }}>
                  {item.step}
                </div>
                <p style={{ fontSize: "13px", color: "#6B5E56", lineHeight: 1.4 }}>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Supported formats */}
          <div className="card" style={{ padding: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
              Supported formats
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { icon: "📄", label: "PDF", desc: "Up to 20MB" },
                { icon: "🖼️", label: "Images", desc: "JPG, PNG, WebP" },
                { icon: "📝", label: "Word", desc: ".docx, .doc" },
                { icon: "📃", label: "Text", desc: ".txt files" },
              ].map((f, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "#FAF7F4", border: "1px solid #F0EBE5" }}>
                  <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>{f.icon}</span>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#2C2420" }}>{f.label}</p>
                  <p style={{ fontSize: "11px", color: "#A89888" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent documents */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Recent
              </p>
              <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#A06040", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                View all →
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {RECENT_DOCS.map((doc) => (
                <div key={doc.id} className="history-item">
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: doc.typeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>
                    📄
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.title}</p>
                    <p style={{ fontSize: "11px", color: "#A89888" }}>{doc.date}</p>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "100px",
                      background: doc.status === "done" ? "#EBF5EB" : "#FFF0EB",
                      color: doc.status === "done" ? "#4A8A4A" : "#A06040",
                      flexShrink: 0,
                    }}
                  >
                    {doc.status === "done" ? "Done" : "Processing"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
