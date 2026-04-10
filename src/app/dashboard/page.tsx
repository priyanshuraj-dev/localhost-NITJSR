"use client";

import { useState, useCallback, useRef } from "react";

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";
type AnalyseState = "idle" | "loading" | "done" | "error";

interface UploadedFile {
  id: string; name: string; size: string;
  typeLabel: string; typeColor: string;
  cloudinaryUrl?: string;
  status: "uploading" | "done" | "error";
}
interface AnalysisStep { step: number; title: string; description: string; office: string; timeframe: string; }
interface AnalysisResult {
  documentType?: string; summary?: string; keyPoints?: string[];
  steps?: AnalysisStep[];
  requiredDocuments?: string[];
  authorities?: { name: string; role: string; contact: string }[];
  portalLinks?: { label: string; url: string }[];
  warnings?: string[];
  estimatedTotalTime?: string; difficulty?: string;
  raw?: string; parseError?: boolean;
}

const FILE_TYPES = [
  { id: "pdf",   icon: "📄", label: "PDF",      accept: ".pdf",       color: "#FFF0EB" },
  { id: "image", icon: "🖼️", label: "Image",    accept: "image/*",    color: "#EBF0FF" },
  { id: "docx",  icon: "📝", label: "Word Doc", accept: ".docx,.doc", color: "#EBF5EB" },
  { id: "txt",   icon: "📃", label: "Text",     accept: ".txt",       color: "#F5EBFF" },
];
const LANGUAGES = ["English","हिन्दी","বাংলা","தமிழ்","తెలుగు","मराठी","ਪੰਜਾਬੀ","ಕನ್ನಡ"];
const DIFF_BG:  Record<string,string> = { Easy:"#EBF5EB", Moderate:"#FFF8EB", Complex:"#FFEBEB" };
const DIFF_CLR: Record<string,string> = { Easy:"#4A8A4A", Moderate:"#A07040", Complex:"#A04040" };

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b/1024).toFixed(1) + " KB";
  return (b/1048576).toFixed(1) + " MB";
}
function getFileTypeInfo(file: File) {
  const m = file.type;
  if (m === "application/pdf") return { typeLabel:"PDF",   typeColor:"#FFF0EB" };
  if (m.startsWith("image/"))  return { typeLabel:"Image", typeColor:"#EBF0FF" };
  if (m === "text/plain")      return { typeLabel:"Text",  typeColor:"#F5EBFF" };
  if (m.includes("wordprocessingml")||m.includes("msword")) return { typeLabel:"Word", typeColor:"#EBF5EB" };
  return { typeLabel:"File", typeColor:"#F5F0EC" };
}

// ─── AI Response Panel ────────────────────────────────────────────────────────
function AIResponsePanel({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const diff = result.difficulty ?? "Moderate";
  return (
    <div style={{ animation: "fadeSlideUp 0.5s ease both" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"28px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px", flexWrap:"wrap" }}>
            <span className="tag-chip" style={{ background:"#FFF0EB", color:"#A06040" }}>✦ Analysis Complete</span>
            {result.difficulty && <span className="tag-chip" style={{ background: DIFF_BG[diff]??"#F5F0EC", color: DIFF_CLR[diff]??"#6B5E56" }}>{result.difficulty}</span>}
            {result.estimatedTotalTime && <span className="tag-chip" style={{ background:"#F0EBE5", color:"#6B5E56" }}>⏱ {result.estimatedTotalTime}</span>}
          </div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(20px,3vw,28px)", color:"#2C2420", fontWeight:700, letterSpacing:"-0.02em" }}>
            {result.documentType ?? "Document Analysis"}
          </h2>
        </div>
        <button className="pill-btn pill-btn-ghost" style={{ fontSize:"13px", padding:"9px 18px" }} onClick={onReset}>← Analyse Another</button>
      </div>

      {result.parseError && result.raw && (
        <div className="card" style={{ padding:"24px", marginBottom:"20px" }}>
          <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"12px" }}>AI Response</p>
          <p style={{ fontSize:"14px", color:"#2C2420", lineHeight:1.8, whiteSpace:"pre-wrap" }}>{result.raw}</p>
        </div>
      )}

      {!result.parseError && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>

          {result.summary && (
            <div className="card" style={{ padding:"24px", gridColumn:"1 / -1", background:"#FFFBF8", border:"1px solid #F0DDD0" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>Summary</p>
              <p style={{ fontSize:"15px", color:"#2C2420", lineHeight:1.8 }}>{result.summary}</p>
            </div>
          )}

          {result.keyPoints && result.keyPoints.length > 0 && (
            <div className="card" style={{ padding:"24px" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"14px" }}>Key Points</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {result.keyPoints.map((pt,i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                    <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"#E8B4A0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, color:"#2C2420", flexShrink:0, marginTop:"1px" }}>{i+1}</div>
                    <p style={{ fontSize:"13px", color:"#6B5E56", lineHeight:1.6 }}>{pt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.requiredDocuments && result.requiredDocuments.length > 0 && (
            <div className="card" style={{ padding:"24px" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"14px" }}>Required Documents</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {result.requiredDocuments.map((doc,i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                    <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#A8C5A0", flexShrink:0 }} />
                    <p style={{ fontSize:"13px", color:"#6B5E56" }}>{doc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.steps && result.steps.length > 0 && (
            <div className="card" style={{ padding:"24px", gridColumn:"1 / -1" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"20px" }}>Step-by-Step Procedure</p>
              <div style={{ display:"flex", flexDirection:"column" }}>
                {result.steps.map((s,i) => (
                  <div key={i} style={{ display:"flex", gap:"16px", paddingBottom: i < result.steps!.length-1 ? "20px" : "0" }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                      <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#2C2420", color:"#FAF7F4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700 }}>{s.step}</div>
                      {i < result.steps!.length-1 && <div style={{ width:"2px", flex:1, background:"#F0EBE5", marginTop:"6px" }} />}
                    </div>
                    <div style={{ paddingTop:"6px", flex:1 }}>
                      <p style={{ fontSize:"14px", fontWeight:600, color:"#2C2420", marginBottom:"4px" }}>{s.title}</p>
                      <p style={{ fontSize:"13px", color:"#6B5E56", lineHeight:1.6, marginBottom:"8px" }}>{s.description}</p>
                      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                        {s.office && <span className="tag-chip" style={{ background:"#EBF0FF", color:"#4060A0" }}>🏛 {s.office}</span>}
                        {s.timeframe && <span className="tag-chip" style={{ background:"#F0EBE5", color:"#6B5E56" }}>⏱ {s.timeframe}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.authorities && result.authorities.length > 0 && (
            <div className="card" style={{ padding:"24px" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"14px" }}>Authorities Involved</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {result.authorities.map((a,i) => (
                  <div key={i} style={{ padding:"12px", borderRadius:"12px", background:"#FAF7F4", border:"1px solid #F0EBE5" }}>
                    <p style={{ fontSize:"13px", fontWeight:600, color:"#2C2420", marginBottom:"2px" }}>{a.name}</p>
                    <p style={{ fontSize:"12px", color:"#6B5E56", marginBottom: a.contact ? "4px" : "0" }}>{a.role}</p>
                    {a.contact && <p style={{ fontSize:"11px", color:"#A89888" }}>{a.contact}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.portalLinks && result.portalLinks.filter(p=>p.url).length > 0 && (
            <div className="card" style={{ padding:"24px" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"14px" }}>Official Portals</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {result.portalLinks.filter(p=>p.url).map((link,i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", borderRadius:"10px", background:"#F5F0EC", border:"1px solid #E8E0D4", textDecoration:"none", transition:"background 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="#EDE8E2")}
                    onMouseLeave={e=>(e.currentTarget.style.background="#F5F0EC")}>
                    <span style={{ fontSize:"14px" }}>🔗</span>
                    <span style={{ fontSize:"13px", fontWeight:500, color:"#2C2420" }}>{link.label}</span>
                    <span style={{ marginLeft:"auto", fontSize:"11px", color:"#A89888" }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {result.warnings && result.warnings.length > 0 && (
            <div className="card" style={{ padding:"24px", gridColumn:"1 / -1", background:"#FFFBEB", border:"1px solid #F0E0B0" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A07040", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"12px" }}>⚠ Important Notices</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {result.warnings.map((w,i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                    <span style={{ color:"#E8A040", flexShrink:0, marginTop:"1px" }}>▲</span>
                    <p style={{ fontSize:"13px", color:"#6B5040", lineHeight:1.6 }}>{w}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [uploadState, setUploadState]       = useState<UploadState>("idle");
  const [analyseState, setAnalyseState]     = useState<AnalyseState>("idle");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [files, setFiles]                   = useState<UploadedFile[]>([]);
  const [selectedLang, setSelectedLang]     = useState("English");
  const [textInput, setTextInput]           = useState("");
  const [inputMode, setInputMode]           = useState<"file" | "text">("file");
  const [analyseError, setAnalyseError]     = useState("");
  const [result, setResult]                 = useState<AnalysisResult | null>(null);
  const fileInputRef                        = useRef<HTMLInputElement>(null);

  const selectedType = FILE_TYPES.find(t => t.id === selectedTypeId);
  const doneFiles    = files.filter(f => f.status === "done");
  const canAnalyse   = analyseState !== "loading" && (
    inputMode === "file" ? doneFiles.length > 0 : textInput.trim().length > 0
  );

  const handleFiles = useCallback(async (rawFiles: FileList | File[]) => {
    const arr = Array.from(rawFiles) as File[];
    if (arr.length === 0) return;
    setUploadState("uploading");
    const newFiles: UploadedFile[] = arr.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name, size: formatBytes(f.size),
      ...getFileTypeInfo(f), status: "uploading" as const,
    }));
    setFiles(prev => [...newFiles, ...prev]);
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]; const entry = newFiles[i];
      try {
        const fd = new FormData();
        fd.append("file", file); fd.append("title", file.name);
        const res  = await fetch("/api/cloudinary/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success && data.uploaded && data.uploaded[0]) {
          setFiles(prev => prev.map(f => f.id === entry.id
            ? { ...f, status: "done", cloudinaryUrl: data.uploaded[0].cloudinaryUrl } : f));
        } else {
          setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error" } : f));
        }
      } catch {
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error" } : f));
      }
    }
    setUploadState("success");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setUploadState("idle"); handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length <= 1) setUploadState("idle");
  };

  const handleAnalyse = async () => {
    setAnalyseState("loading"); setAnalyseError("");
    try {
      const body: Record<string, string> = { language: selectedLang };
      if (inputMode === "file" && doneFiles[0] && doneFiles[0].cloudinaryUrl) {
        body.cloudinaryUrl = doneFiles[0].cloudinaryUrl;
        body.fileName      = doneFiles[0].name;
      } else if (inputMode === "text") {
        body.text = textInput; body.fileName = "Pasted Text";
      }
      const res  = await fetch("/api/analyse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { setResult(data.result); setAnalyseState("done"); }
      else { setAnalyseError(data.error || "Analysis failed"); setAnalyseState("error"); }
    } catch { setAnalyseError("Network error — please try again"); setAnalyseState("error"); }
  };

  const handleReset = () => {
    setResult(null); setAnalyseState("idle"); setAnalyseError("");
    setFiles([]); setUploadState("idle"); setTextInput("");
  };

  if (analyseState === "done" && result) return <AIResponsePanel result={result} onReset={handleReset} />;

  return (
    <div style={{ animation: "fadeSlideUp 0.5s ease both" }}>
      <div style={{ marginBottom: "32px" }}>
        <span className="tag-chip" style={{ background: "#FFF0EB", color: "#A06040", marginBottom: "12px" }}>✦ Upload and Analyse</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px,3vw,36px)", color: "#2C2420", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "8px" }}>
          Upload a Government Document
        </h1>
        <p style={{ fontSize: "15px", color: "#6B5E56", lineHeight: 1.6 }}>Drop any legal notice, form, or procedure document and get a plain-language guide in seconds.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>
        <div className="card" style={{ padding: "32px" }}>

          <div style={{ display: "flex", gap: "4px", background: "#F5F0EC", borderRadius: "12px", padding: "4px", marginBottom: "28px", width: "fit-content" }}>
            {(["file", "text"] as const).map(mode => (
              <button key={mode} onClick={() => setInputMode(mode)}
                style={{ padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  background: inputMode === mode ? "white" : "transparent",
                  color:      inputMode === mode ? "#2C2420" : "#A89888",
                  boxShadow:  inputMode === mode ? "0 2px 8px rgba(0,0,0,0.06)" : "none", transition: "all 0.2s" }}>
                {mode === "file" ? "📎 File Upload" : "✏️ Paste Text"}
              </button>
            ))}
          </div>

          {inputMode === "file" ? (
            <>
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>File type</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                  {FILE_TYPES.map(ft => (
                    <button key={ft.id} className={"file-type-btn " + (selectedTypeId === ft.id ? "selected" : "")}
                      onClick={() => setSelectedTypeId(selectedTypeId === ft.id ? null : ft.id)}
                      style={{ background: selectedTypeId === ft.id ? ft.color : "white" }}>
                      <span style={{ fontSize: "24px" }}>{ft.icon}</span>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#2C2420" }}>{ft.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={"upload-zone" + (uploadState === "dragging" ? " dragging" : "") + (uploadState === "success" ? " done" : "")}
                onDragOver={e => { e.preventDefault(); setUploadState("dragging"); }}
                onDragLeave={() => setUploadState("idle")}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <input ref={fileInputRef} type="file" multiple
                  accept={selectedType ? selectedType.accept : ".pdf,.docx,.doc,.txt,image/*"}
                  style={{ display: "none" }} onChange={handleFileInput} />
                {uploadState === "idle" && <>
                  <div style={{ fontSize: "48px", marginBottom: "16px", color: "#D4C4B0" }}>⬡</div>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#2C2420", marginBottom: "8px" }}>Drop your document here</p>
                  <p style={{ fontSize: "13px", color: "#A89888", marginBottom: "20px" }}>PDF, JPG, PNG, DOCX, TXT · Max 10 MB</p>
                  <button className="pill-btn pill-btn-primary" style={{ fontSize: "13px", padding: "10px 22px" }}
                    onClick={e => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click(); }}>Browse Files</button>
                </>}
                {uploadState === "dragging" && <p style={{ fontSize: "18px", fontWeight: 600, color: "#E8B4A0" }}>Release to upload</p>}
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
                    <p style={{ fontSize: "13px", color: "#6B5E56" }}>Saved to Cloudinary and MongoDB</p>
                    <button className="pill-btn pill-btn-ghost" style={{ fontSize: "12px", padding: "8px 18px", marginTop: "4px" }}
                      onClick={e => { e.stopPropagation(); setUploadState("idle"); }}>Upload more</button>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>Files</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {files.map(f => (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", background: "#FAF7F4", border: "1px solid #F0EBE5" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: f.typeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                          {f.typeLabel === "PDF" ? "📄" : f.typeLabel === "Image" ? "🖼️" : f.typeLabel === "Word" ? "📝" : "📃"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#2C2420", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                          <p style={{ fontSize: "11px", color: "#A89888" }}>{f.size} · {f.typeLabel}</p>
                          {f.cloudinaryUrl && (
                            <a href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "11px", color: "#A06040", textDecoration: "none" }}
                              onClick={e => e.stopPropagation()}>View on Cloudinary ↗</a>
                          )}
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {f.status === "uploading" && <div style={{ width: "18px", height: "18px", border: "2px solid #E8E0D4", borderTopColor: "#2C2420", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                          {f.status === "done"      && <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#A8C5A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white" }}>✓</div>}
                          {f.status === "error"     && <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#F0A0A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "white" }}>✕</div>}
                        </div>
                        <button onClick={() => removeFile(f.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#C4B8B0", fontSize: "16px", padding: "2px", borderRadius: "4px", transition: "color 0.2s", flexShrink: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#2C2420")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#C4B8B0")}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>Paste document text</p>
              <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                placeholder="Paste the content of any government notice, legal document, or procedure here…"
                style={{ width: "100%", minHeight: "240px", padding: "20px", borderRadius: "16px", border: "1.5px solid #E8E0D4", background: "#FAFAFA", fontSize: "14px", color: "#2C2420", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, resize: "vertical", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "#E8B4A0"; e.target.style.boxShadow = "0 0 0 3px rgba(232,180,160,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "#E8E0D4"; e.target.style.boxShadow = "none"; }} />
              <p style={{ fontSize: "12px", color: "#A89888", marginTop: "8px" }}>{textInput.length} characters</p>
            </div>
          )}

          <div style={{ marginTop: "28px", paddingTop: "24px", borderTop: "1px solid #F0EBE5" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>Output language</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {LANGUAGES.map(lang => (
                <button key={lang} className={"lang-badge" + (selectedLang === lang ? " selected" : "")} onClick={() => setSelectedLang(lang)}>{lang}</button>
              ))}
            </div>
            {analyseError && (
              <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#FFEBEB", border: "1px solid #F0C0C0", marginBottom: "16px" }}>
                <p style={{ fontSize: "13px", color: "#A04040" }}>⚠ {analyseError}</p>
              </div>
            )}
            <button className="pill-btn pill-btn-accent"
              style={{ width: "100%", justifyContent: "center", fontSize: "15px", padding: "14px", opacity: canAnalyse ? 1 : 0.5, cursor: canAnalyse ? "pointer" : "not-allowed" }}
              disabled={!canAnalyse} onClick={handleAnalyse}>
              {analyseState === "loading"
                ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(44,36,32,0.3)", borderTopColor: "#2C2420", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: "8px", display: "inline-block" }} />Analysing…</>
                : "✦ Generate Plain-Language Guide"}
            </button>
            <p style={{ fontSize: "12px", color: "#A89888", textAlign: "center", marginTop: "10px" }}>
              {inputMode === "file" && doneFiles.length === 0 ? "Upload a file first" : "AI analysis · Results in ~30 seconds"}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>How it works</p>
            {[
              { step: "01", label: "Upload your document",               color: "#FFF0EB" },
              { step: "02", label: "AI reads and identifies procedure",   color: "#EBF5EB" },
              { step: "03", label: "Get a step-by-step guide",           color: "#EBF0FF" },
              { step: "04", label: "Follow in your language",            color: "#F5EBFF" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: i < 3 ? "12px" : "0" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#2C2420", flexShrink: 0 }}>{item.step}</div>
                <p style={{ fontSize: "13px", color: "#6B5E56", lineHeight: 1.4 }}>{item.label}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "24px" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>Supported formats</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[{ icon: "📄", label: "PDF", desc: "Up to 10MB" }, { icon: "🖼️", label: "Images", desc: "JPG, PNG, WebP" }, { icon: "📝", label: "Word", desc: ".docx, .doc" }, { icon: "📃", label: "Text", desc: ".txt files" }].map((f, i) => (
                <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "#FAF7F4", border: "1px solid #F0EBE5" }}>
                  <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>{f.icon}</span>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#2C2420" }}>{f.label}</p>
                  <p style={{ fontSize: "11px", color: "#A89888" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "24px", background: "#2C2420" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#A89888", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>What you get</p>
            {["Plain-language summary", "Step-by-step procedure", "Required documents list", "Authorities and offices", "Official portal links", "Multilingual output"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: i < 5 ? "10px" : "0" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#E8B4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: "#2C2420", flexShrink: 0 }}>✓</div>
                <p style={{ fontSize: "13px", color: "#A89888" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
