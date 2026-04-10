"use client";

import { useState, useCallback, useRef } from "react";
import { useTokens } from "@/context/TokenContext";
import { useToast } from "@/components/Toast";

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
  formLinks?: { name: string; url: string; description?: string }[];
  portalLinks?: { label: string; url: string }[];
  warnings?: string[];
  estimatedTotalTime?: string; difficulty?: string;
  raw?: string; parseError?: boolean;
}

const FILE_TYPES = [
  { id: "pdf",   icon: "📄", label: "PDF",      accept: ".pdf",       color: "#FFF0EB", accent: "#E8B4A0" },
  { id: "image", icon: "🖼️", label: "Image",    accept: "image/*",    color: "#F0EBFF", accent: "#C4A8E8" },
  { id: "docx",  icon: "📝", label: "Word Doc", accept: ".docx,.doc", color: "#EBF5EB", accent: "#A8C5A0" },
  { id: "txt",   icon: "📃", label: "Text",     accept: ".txt",       color: "#FFF5F8", accent: "#E8A0B4" },
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
  if (m.startsWith("image/"))  return { typeLabel:"Image", typeColor:"#F0EBFF" };
  if (m === "text/plain")      return { typeLabel:"Text",  typeColor:"#FFF5F8" };
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
            <span className="tag-chip" style={{ background:"linear-gradient(135deg,#FFF0EB,#FFE8F0)", color:"#A06040" }}>✦ Analysis Complete</span>
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
            <div className="card" style={{ padding:"24px", gridColumn:"1 / -1", background:"linear-gradient(135deg,#FFFBF8,#FFF5F8)", border:"1px solid #F0DDD0" }}>
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
                    <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"linear-gradient(135deg,#E8B4A0,#E8A0B4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:700, color:"#2C2420", flexShrink:0, marginTop:"1px" }}>{i+1}</div>
                    <p style={{ fontSize:"13px", color:"#6B5E56", lineHeight:1.6 }}>{pt}</p>
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
                      <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,#2C2420,#4A3830)", color:"#FAF7F4", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:700 }}>{s.step}</div>
                      {i < result.steps!.length-1 && <div style={{ width:"2px", flex:1, background:"linear-gradient(to bottom,#E8B4A0,#F0EBE5)", marginTop:"6px" }} />}
                    </div>
                    <div style={{ paddingTop:"6px", flex:1 }}>
                      <p style={{ fontSize:"14px", fontWeight:600, color:"#2C2420", marginBottom:"4px" }}>{s.title}</p>
                      <p style={{ fontSize:"13px", color:"#6B5E56", lineHeight:1.6, marginBottom:"8px" }}>{s.description}</p>
                      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                        {s.office && <span className="tag-chip" style={{ background:"#F0EBE5", color:"#6B5E56" }}>🏛 {s.office}</span>}
                        {s.timeframe && <span className="tag-chip" style={{ background:"#F0EBE5", color:"#6B5E56" }}>⏱ {s.timeframe}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forms & Portals */}
          {((result.formLinks && result.formLinks.length > 0) || (result.portalLinks && result.portalLinks.length > 0)) && (
            <div className="card" style={{ padding:"24px", gridColumn:"1 / -1" }}>
              <p style={{ fontSize:"12px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"20px" }}>🔗 Forms & Government Portals</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
                {result.formLinks && result.formLinks.length > 0 && (
                  <div>
                    <p style={{ fontSize:"11px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>📄 Official Forms</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                      {result.formLinks.map((f, i) => (
                        <a key={i} href={f.url} target="_blank" rel="noreferrer"
                          style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"12px 14px", borderRadius:"14px", border:"1px solid #F0EBE5", background:"#FAF7F4", textDecoration:"none", transition:"all 0.2s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E8B4A0"; (e.currentTarget as HTMLAnchorElement).style.background = "#FFF8F5"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F0EBE5"; (e.currentTarget as HTMLAnchorElement).style.background = "#FAF7F4"; }}
                        >
                          <span style={{ fontSize:"20px", flexShrink:0 }}>📋</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:"13px", fontWeight:600, color:"#2C2420", marginBottom:"2px" }}>{f.name}</p>
                            {f.description && <p style={{ fontSize:"11px", color:"#A89888", lineHeight:1.5 }}>{f.description}</p>}
                            <p style={{ fontSize:"11px", color:"#C4845A", marginTop:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.url}</p>
                          </div>
                          <span style={{ color:"#D4C4B0", fontSize:"16px", flexShrink:0 }}>↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {result.portalLinks && result.portalLinks.length > 0 && (
                  <div>
                    <p style={{ fontSize:"11px", fontWeight:600, color:"#A89888", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"10px" }}>🌐 Government Portals</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                      {result.portalLinks.map((p, i) => (
                        <a key={i} href={p.url} target="_blank" rel="noreferrer"
                          style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"12px 14px", borderRadius:"14px", border:"1px solid #F0EBE5", background:"#FAF7F4", textDecoration:"none", transition:"all 0.2s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E8B4A0"; (e.currentTarget as HTMLAnchorElement).style.background = "#FFF8F5"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#F0EBE5"; (e.currentTarget as HTMLAnchorElement).style.background = "#FAF7F4"; }}
                        >
                          <span style={{ fontSize:"20px", flexShrink:0 }}>🏛️</span>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:"13px", fontWeight:600, color:"#2C2420", marginBottom:"2px" }}>{p.label}</p>
                            <p style={{ fontSize:"11px", color:"#C4845A", marginTop:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.url}</p>
                          </div>
                          <span style={{ color:"#D4C4B0", fontSize:"16px", flexShrink:0 }}>↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t, dark } = useTokens();
  const { toast } = useToast();
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

  const selectedType = FILE_TYPES.find(ft => ft.id === selectedTypeId);
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
          toast(`${file.name} uploaded successfully`, "success");
        } else {
          setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error" } : f));
          toast(`Failed to upload ${file.name}`, "error");
        }
      } catch {
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "error" } : f));
        toast(`Upload error for ${file.name}`, "error");
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
      if (inputMode === "file" && doneFiles[0]?.cloudinaryUrl) {
        toast("Sending document for AI analysis…", "info");
        sessionStorage.setItem("legalFileUrl", doneFiles[0].cloudinaryUrl);
        sessionStorage.removeItem("legalText");
        window.location.href = "/result";
        return;
      } else if (inputMode === "text" && textInput.trim().length >= 20) {
        toast("Sending text for AI analysis…", "info");
        sessionStorage.setItem("legalText", textInput.trim());
        sessionStorage.removeItem("legalFileUrl");
        window.location.href = "/result";
        return;
      }
      const msg = "Please upload a file or paste text first.";
      setAnalyseError(msg);
      toast(msg, "warning");
      setAnalyseState("error");
    } catch {
      const msg = "Network error — please try again";
      setAnalyseError(msg);
      toast(msg, "error");
      setAnalyseState("error");
    }
  };

  const handleReset = () => {
    setResult(null); setAnalyseState("idle"); setAnalyseError("");
    setFiles([]); setUploadState("idle"); setTextInput("");
  };

  if (analyseState === "done" && result) return <AIResponsePanel result={result} onReset={handleReset} />;

  return (
    <div style={{ animation: "fadeSlideUp 0.5s ease both" }}>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        marginBottom: "36px",
        padding: "40px 44px",
        borderRadius: "28px",
        overflow: "hidden",
        background: dark
          ? "linear-gradient(135deg, #1A1210 0%, #2C1A22 50%, #1C1420 100%)"
          : "linear-gradient(135deg, #2C2420 0%, #3D2030 50%, #2A1C2E 100%)",
      }}>
        {/* Decorative orbs */}
        <div style={{ position:"absolute", top:"-60px", right:"-40px", width:"280px", height:"280px", borderRadius:"50%", background:"radial-gradient(circle, rgba(232,160,180,0.18) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-80px", left:"30%", width:"320px", height:"320px", borderRadius:"50%", background:"radial-gradient(circle, rgba(232,180,160,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"20px", left:"45%", width:"180px", height:"180px", borderRadius:"50%", background:"radial-gradient(circle, rgba(200,160,232,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:"24px" }}>
          <div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"5px 14px", borderRadius:"100px", background:"rgba(232,160,180,0.15)", border:"1px solid rgba(232,160,180,0.25)", marginBottom:"18px" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#E8A0B4" }} />
              <span style={{ fontSize:"11px", fontWeight:600, color:"#E8C0CC", letterSpacing:"0.1em", textTransform:"uppercase" }}>Upload &amp; Analyse</span>
            </div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(26px,3.5vw,44px)", color:"#FAF7F4", fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.15, marginBottom:"12px" }}>
              Understand Any<br />
              <span style={{ fontStyle:"italic", color:"#E8B4A0" }}>Government Document</span>
            </h1>
            <p style={{ fontSize:"14px", color:"rgba(250,247,244,0.55)", lineHeight:1.7, maxWidth:"420px" }}>
              Drop any legal notice, form, or procedure — get a plain-language guide in seconds.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            {[
              { num:"8+", label:"Languages" },
              { num:"4",  label:"File types" },
              { num:"~30s", label:"Analysis" },
            ].map((s,i) => (
              <div key={i} style={{ padding:"16px 20px", borderRadius:"18px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", textAlign:"center", minWidth:"80px" }}>
                <p style={{ fontFamily:"'Playfair Display', serif", fontSize:"22px", fontWeight:700, color:"#FAF7F4", lineHeight:1 }}>{s.num}</p>
                <p style={{ fontSize:"11px", color:"rgba(250,247,244,0.5)", marginTop:"4px", fontWeight:500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main 2-col grid ──────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"24px", alignItems:"start" }}>

        {/* LEFT — Upload Card */}
        <div style={{
          background: dark ? t.bgCard : "#FFFFFF",
          borderRadius:"24px",
          border:`1px solid ${dark ? t.border : "#F0EBE5"}`,
          boxShadow:"0 4px 24px rgba(44,36,32,0.06), 0 1px 4px rgba(232,160,180,0.08)",
          overflow:"hidden",
        }}>
          {/* Rainbow gradient top strip */}
          <div style={{ height:"3px", background:"linear-gradient(90deg, #E8B4A0, #E8A0B4, #C4A8E8, #A8C5A0)" }} />

          <div style={{ padding:"32px" }}>
            {/* Mode Toggle */}
            <div style={{ display:"flex", gap:"4px", background:dark ? t.bgSubtle : "#F5F0EC", borderRadius:"14px", padding:"4px", marginBottom:"32px", width:"fit-content" }}>
              {(["file", "text"] as const).map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)}
                  style={{
                    padding:"9px 22px", borderRadius:"11px", border:"none", cursor:"pointer",
                    fontSize:"13px", fontWeight:600, fontFamily:"'DM Sans', sans-serif",
                    background: inputMode === mode ? dark ? t.bgCard : "#FFFFFF" : "transparent",
                    color: inputMode === mode ? t.text : t.textMuted,
                    boxShadow: inputMode === mode ? "0 2px 12px rgba(44,36,32,0.08), 0 0 0 1px rgba(232,160,180,0.15)" : "none",
                    transition:"all 0.2s",
                  }}>
                  {mode === "file" ? "📎 File Upload" : "✏️ Paste Text"}
                </button>
              ))}
            </div>

            {inputMode === "file" ? (
              <>
                {/* File type selector */}
                <div style={{ marginBottom:"28px" }}>
                  <p style={{ fontSize:"11px", fontWeight:600, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px" }}>Choose File Type</p>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
                    {FILE_TYPES.map(ft => (
                      <button key={ft.id}
                        onClick={() => setSelectedTypeId(selectedTypeId === ft.id ? null : ft.id)}
                        style={{
                          display:"flex", flexDirection:"column", alignItems:"center", gap:"8px",
                          padding:"18px 12px", borderRadius:"16px", cursor:"pointer",
                          border: selectedTypeId === ft.id ? `2px solid ${ft.accent}` : `1.5px solid ${dark ? t.borderMid : "#EDE5DC"}`,
                          background: selectedTypeId === ft.id ? ft.color : dark ? t.bgCard : "#FAFAF8",
                          transition:"all 0.2s ease",
                          transform: selectedTypeId === ft.id ? "translateY(-2px)" : "none",
                          boxShadow: selectedTypeId === ft.id ? `0 8px 24px ${ft.accent}30` : "none",
                          fontFamily:"'DM Sans', sans-serif",
                        }}>
                        <span style={{ fontSize:"22px" }}>{ft.icon}</span>
                        <span style={{ fontSize:"11px", fontWeight:600, color:t.text }}>{ft.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setUploadState("dragging"); }}
                  onDragLeave={() => setUploadState("idle")}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position:"relative",
                    border: uploadState === "dragging"
                      ? "2px dashed #E8A0B4"
                      : uploadState === "success"
                        ? "2px dashed #A8C5A0"
                        : `2px dashed ${dark ? t.borderMid : "#DDD5CC"}`,
                    borderRadius:"20px",
                    padding:"52px 32px",
                    textAlign:"center",
                    cursor:"pointer",
                    background: uploadState === "dragging"
                      ? "linear-gradient(135deg,rgba(255,245,248,0.8),rgba(255,240,235,0.8))"
                      : uploadState === "success"
                        ? "linear-gradient(135deg,#F0FAF0,#F0F8F0)"
                        : dark ? t.bgSubtle : "linear-gradient(135deg,#FAFAF8,#FFF8FC)",
                    transition:"all 0.3s ease",
                    transform: uploadState === "dragging" ? "scale(1.01)" : "none",
                    overflow:"hidden",
                  }}>
                  <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"radial-gradient(circle, rgba(232,160,180,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />

                  <input ref={fileInputRef} type="file" multiple
                    accept={selectedType ? selectedType.accept : ".pdf,.docx,.doc,.txt,image/*"}
                    style={{ display:"none" }} onChange={handleFileInput} />

                  {uploadState === "idle" && (
                    <>
                      <div style={{ width:"60px", height:"60px", borderRadius:"18px", background:"linear-gradient(135deg,#FFF0EB,#FFE8F0)", border:"1px solid rgba(232,160,180,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", margin:"0 auto 18px" }}>⬆</div>
                      <p style={{ fontSize:"16px", fontWeight:600, color:t.text, marginBottom:"6px" }}>Drop your document here</p>
                      <p style={{ fontSize:"13px", color:t.textMuted, marginBottom:"22px", lineHeight:1.6 }}>PDF, JPG, PNG, DOCX, TXT · Max 10 MB</p>
                      <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        style={{ fontSize:"13px", padding:"11px 26px", background:"linear-gradient(135deg,#2C2420,#3D2030)", color:"#FAF7F4", border:"none", cursor:"pointer", borderRadius:"100px", fontFamily:"'DM Sans', sans-serif", fontWeight:600, boxShadow:"0 4px 16px rgba(44,36,32,0.25)", transition:"all 0.2s" }}>
                        Browse Files
                      </button>
                    </>
                  )}
                  {uploadState === "dragging" && (
                    <p style={{ fontSize:"18px", fontWeight:600, color:"#E8A0B4" }}>Release to upload ✦</p>
                  )}
                  {uploadState === "uploading" && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
                      <div style={{ width:"40px", height:"40px", border:"3px solid #F0E8EC", borderTopColor:"#E8A0B4", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                      <p style={{ fontSize:"14px", color:t.textSec }}>Uploading to Cloudinary…</p>
                    </div>
                  )}
                  {uploadState === "success" && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"linear-gradient(135deg,#A8C5A0,#80B878)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", color:"white" }}>✓</div>
                      <p style={{ fontSize:"15px", fontWeight:600, color:t.text }}>Upload complete</p>
                      <p style={{ fontSize:"13px", color:t.textSec }}>Saved to Cloudinary and MongoDB</p>
                      <button className="pill-btn pill-btn-ghost" style={{ fontSize:"12px", padding:"8px 18px", marginTop:"4px" }}
                        onClick={e => { e.stopPropagation(); setUploadState("idle"); }}>Upload more</button>
                    </div>
                  )}
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div style={{ marginTop:"20px" }}>
                    <p style={{ fontSize:"11px", fontWeight:600, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"10px" }}>Queued Files</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                      {files.map(f => (
                        <div key={f.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", borderRadius:"14px", background:dark ? t.bgSubtle : "#FAF7F4", border:`1px solid ${dark ? t.border : "#F0EBE5"}` }}>
                          <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:f.typeColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                            {f.typeLabel === "PDF" ? "📄" : f.typeLabel === "Image" ? "🖼️" : f.typeLabel === "Word" ? "📝" : "📃"}
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:"13px", fontWeight:600, color:t.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</p>
                            <p style={{ fontSize:"11px", color:t.textMuted }}>{f.size} · {f.typeLabel}</p>
                            {f.cloudinaryUrl && (
                              <a href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                                style={{ fontSize:"11px", color:"#A06040", textDecoration:"none" }}
                                onClick={e => e.stopPropagation()}>View on Cloudinary ↗</a>
                            )}
                          </div>
                          <div style={{ flexShrink:0 }}>
                            {f.status === "uploading" && <div style={{ width:"18px", height:"18px", border:"2px solid #F0E8EC", borderTopColor:"#E8A0B4", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />}
                            {f.status === "done"      && <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"linear-gradient(135deg,#A8C5A0,#80B878)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", color:"white" }}>✓</div>}
                            {f.status === "error"     && <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"#F0A0A0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", color:"white" }}>✕</div>}
                          </div>
                          <button onClick={() => removeFile(f.id)}
                            style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, fontSize:"18px", padding:"2px 4px", borderRadius:"6px", transition:"color 0.2s", flexShrink:0 }}
                            onMouseEnter={e => (e.currentTarget.style.color = t.text)}
                            onMouseLeave={e => (e.currentTarget.style.color = t.textMuted)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p style={{ fontSize:"11px", fontWeight:600, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"12px" }}>Paste Document Text</p>
                <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                  placeholder="Paste the content of any government notice, legal document, or procedure here…"
                  style={{ width:"100%", minHeight:"240px", padding:"20px", borderRadius:"16px", border:`1.5px solid ${dark ? t.borderMid : "#E8E0D4"}`, background:dark ? t.bgSubtle : "#FAFAF8", fontSize:"14px", color:t.text, fontFamily:"'DM Sans', sans-serif", lineHeight:1.7, resize:"vertical", outline:"none", transition:"border-color 0.2s, box-shadow 0.2s" }}
                  onFocus={e => { e.target.style.borderColor = "#E8A0B4"; e.target.style.boxShadow = "0 0 0 3px rgba(232,160,180,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = dark ? t.borderMid : "#E8E0D4"; e.target.style.boxShadow = "none"; }} />
                <p style={{ fontSize:"12px", color:t.textMuted, marginTop:"8px" }}>{textInput.length} characters</p>
              </div>
            )}
          </div>

          {/* Language + CTA footer */}
          <div style={{ padding:"24px 32px 32px", borderTop:`1px solid ${dark ? t.border : "#F0EBE5"}`, background:dark ? "rgba(0,0,0,0.08)" : "linear-gradient(135deg,#FDF9F7,#FDF7FB)" }}>
            <p style={{ fontSize:"11px", fontWeight:600, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"12px" }}>Output Language</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"22px" }}>
              {LANGUAGES.map(lang => (
                <button key={lang} onClick={() => setSelectedLang(lang)}
                  style={{
                    padding:"5px 13px", borderRadius:"100px", fontSize:"12px", fontWeight:500,
                    background: selectedLang === lang ? "linear-gradient(135deg,#2C2420,#3D2030)" : dark ? t.bgCard : "#FFFFFF",
                    color: selectedLang === lang ? "#FAF7F4" : t.textSec,
                    border: selectedLang === lang ? "1.5px solid transparent" : `1.5px solid ${dark ? t.borderMid : "#E8E0D4"}`,
                    cursor:"pointer", transition:"all 0.2s", fontFamily:"'DM Sans', sans-serif",
                  }}>
                  {lang}
                </button>
              ))}
            </div>

            {analyseError && (
              <div style={{ padding:"12px 16px", borderRadius:"12px", background:"#FFEBEB", border:"1px solid #F0C0C0", marginBottom:"16px" }}>
                <p style={{ fontSize:"13px", color:"#A04040" }}>⚠ {analyseError}</p>
              </div>
            )}

            <button disabled={!canAnalyse} onClick={handleAnalyse}
              style={{
                width:"100%", padding:"16px", borderRadius:"100px", border:"none",
                cursor: canAnalyse ? "pointer" : "not-allowed",
                background: canAnalyse
                  ? "linear-gradient(135deg, #E8B4A0 0%, #E8A0B4 50%, #C4A8E8 100%)"
                  : dark ? t.bgSubtle : "#EDE5DC",
                color: canAnalyse ? "#2C2420" : t.textMuted,
                fontSize:"15px", fontWeight:700, fontFamily:"'DM Sans', sans-serif",
                letterSpacing:"0.02em",
                boxShadow: canAnalyse ? "0 8px 32px rgba(232,160,180,0.35), 0 2px 8px rgba(196,168,232,0.2)" : "none",
                transition:"all 0.25s ease",
                opacity: canAnalyse ? 1 : 0.5,
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
              }}>
              {analyseState === "loading" ? (
                <>
                  <div style={{ width:"16px", height:"16px", border:"2px solid rgba(44,36,32,0.25)", borderTopColor:"#2C2420", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                  Analysing…
                </>
              ) : "✦ Generate Plain-Language Guide"}
            </button>
            <p style={{ fontSize:"12px", color:t.textMuted, textAlign:"center", marginTop:"10px" }}>
              {inputMode === "file" && doneFiles.length === 0 ? "Upload a file first to continue" : "AI-powered · Results in ~30 seconds"}
            </p>
          </div>
        </div>

        {/* RIGHT — Info sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

          {/* How it works */}
          <div style={{ background:dark ? t.bgCard : "#FFFFFF", borderRadius:"22px", border:`1px solid ${dark ? t.border : "#F0EBE5"}`, padding:"24px", boxShadow:"0 2px 16px rgba(44,36,32,0.05)" }}>
            <p style={{ fontSize:"11px", fontWeight:600, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"20px" }}>How It Works</p>
            {[
              { step:"01", label:"Upload your document",   desc:"PDF, image, Word, or text",    color:"#FFF0EB", accent:"#E8B4A0" },
              { step:"02", label:"AI reads & identifies",  desc:"Extracts key procedures",       color:"#FFF5F8", accent:"#E8A0B4" },
              { step:"03", label:"Get your guide",         desc:"Step-by-step plain language",   color:"#F5F0FF", accent:"#C4A8E8" },
              { step:"04", label:"Follow in your language",desc:"8 Indian languages supported",  color:"#EBF5EB", accent:"#A8C5A0" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", gap:"14px", alignItems:"flex-start", paddingBottom:i < 3 ? "16px" : "0", position:"relative" }}>
                {i < 3 && <div style={{ position:"absolute", left:"16px", top:"36px", width:"1.5px", height:"calc(100% - 20px)", background:`linear-gradient(to bottom, ${item.accent}50, transparent)` }} />}
                <div style={{ width:"34px", height:"34px", borderRadius:"12px", background:item.color, border:`1px solid ${item.accent}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:item.accent, flexShrink:0, position:"relative", zIndex:1 }}>{item.step}</div>
                <div style={{ paddingTop:"4px" }}>
                  <p style={{ fontSize:"13px", fontWeight:600, color:t.text, marginBottom:"2px" }}>{item.label}</p>
                  <p style={{ fontSize:"12px", color:t.textMuted }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Supported formats */}
          <div style={{ background:dark ? t.bgCard : "#FFFFFF", borderRadius:"22px", border:`1px solid ${dark ? t.border : "#F0EBE5"}`, padding:"24px", boxShadow:"0 2px 16px rgba(44,36,32,0.05)" }}>
            <p style={{ fontSize:"11px", fontWeight:600, color:t.textMuted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"14px" }}>Supported Formats</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {[
                { icon:"📄", label:"PDF",    desc:"Up to 10 MB",    color:"#FFF0EB" },
                { icon:"🖼️", label:"Images", desc:"JPG, PNG, WebP", color:"#F0EBFF" },
                { icon:"📝", label:"Word",   desc:".docx, .doc",    color:"#EBF5EB" },
                { icon:"📃", label:"Text",   desc:".txt files",     color:"#FFF5F8" },
              ].map((f, i) => (
                <div key={i} style={{ padding:"14px", borderRadius:"14px", background:dark ? t.bgSubtle : f.color, border:`1px solid ${dark ? t.border : "transparent"}` }}>
                  <span style={{ fontSize:"18px", display:"block", marginBottom:"6px" }}>{f.icon}</span>
                  <p style={{ fontSize:"12px", fontWeight:700, color:t.text, marginBottom:"2px" }}>{f.label}</p>
                  <p style={{ fontSize:"11px", color:t.textMuted }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What you get — dark gradient card */}
          <div style={{ borderRadius:"22px", padding:"24px", background:"linear-gradient(135deg, #2C2420 0%, #3D2030 60%, #2A1C2E 100%)", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"160px", height:"160px", borderRadius:"50%", background:"radial-gradient(circle, rgba(232,160,180,0.15) 0%, transparent 70%)" }} />
            <p style={{ fontSize:"11px", fontWeight:600, color:"rgba(250,247,244,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"16px", position:"relative", zIndex:1 }}>What You Get</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px", position:"relative", zIndex:1 }}>
              {[
                { label:"Plain-language summary",   color:"#E8B4A0" },
                { label:"Step-by-step procedure",   color:"#E8A0B4" },
                { label:"Required documents list",  color:"#C4A8E8" },
                { label:"Authorities and offices",  color:"#A8C5A0" },
                { label:"Official portal links",    color:"#E8B4A0" },
                { label:"Multilingual output",      color:"#E8A0B4" },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"18px", height:"18px", borderRadius:"50%", background:item.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"#2C2420", flexShrink:0, fontWeight:700 }}>✓</div>
                  <p style={{ fontSize:"13px", color:"rgba(250,247,244,0.75)", fontWeight:500 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tip */}
          <div style={{ borderRadius:"18px", padding:"18px 20px", background:"linear-gradient(135deg, #FFF5F8, #FFF0EB)", border:"1px solid rgba(232,160,180,0.25)" }}>
            <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
              <div style={{ fontSize:"20px", flexShrink:0 }}>💡</div>
              <div>
                <p style={{ fontSize:"12px", fontWeight:700, color:"#2C2420", marginBottom:"4px" }}>Pro tip</p>
                <p style={{ fontSize:"12px", color:"#6B5E56", lineHeight:1.6 }}>For best results with image documents, ensure the text is clear and well-lit before uploading.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}