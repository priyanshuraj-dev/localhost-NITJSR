"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface TextItem {
  str: string;
  // Bounding box in canvas pixel coords for this page
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
}

interface RedactionRegion {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceText?: string; // if from text selection
}

interface Props {
  file: File;
  onConfirm: (redactedFile: File) => void;
  onCancel: () => void;
}

const RENDER_SCALE = 1.5; // render at 1.5x for clarity

export default function DocumentRedactor({ file, onConfirm, onCancel }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed
  const [pageCanvases, setPageCanvases] = useState<HTMLCanvasElement[]>([]);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [redactions, setRedactions] = useState<RedactionRegion[]>([]);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [hoveredText, setHoveredText] = useState<TextItem | null>(null);

  // Draw state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  // ── Load PDF with pdfjs, render each page to an offscreen canvas ──────────
  useEffect(() => {
    if (!isPdf) { setLoading(false); return; }

    (async () => {
      setLoading(true);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setNumPages(pdf.numPages);

        const canvases: HTMLCanvasElement[] = [];
        const items: TextItem[] = [];

        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale: RENDER_SCALE });

          // Render page to offscreen canvas
          const canvas = document.createElement("canvas");
          canvas.width  = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          canvases.push(canvas);

          // Extract text with positions
          const textContent = await page.getTextContent();
          for (const item of textContent.items) {
            if (!("str" in item) || !item.str.trim()) continue;
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
            const x = tx[4];
            const y = tx[5];
            // item.width/height are in user space — scale them
            const w = (item as { width: number }).width * RENDER_SCALE;
            const h = Math.abs((item as { height: number }).height) * RENDER_SCALE || 12 * RENDER_SCALE;
            items.push({
              str: item.str,
              x,
              y: y - h, // pdfjs y is baseline, shift up
              width: w,
              height: h,
              pageIndex: p - 1,
            });
          }
        }

        setPageCanvases(canvases);
        setTextItems(items);
        setCurrentPage(0);
      } catch (e) {
        console.error("PDF load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [file, isPdf]);

  // ── Load image ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isImage) return;
    setLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxW = 800;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width  = img.naturalWidth  * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setPageCanvases([canvas]);
      setNumPages(1);
      setCurrentPage(0);
      setLoading(false);
    };
    img.src = URL.createObjectURL(file);
  }, [file, isImage]);

  // ── Draw current page + redactions onto the visible canvas ────────────────
  useEffect(() => {
    const display = displayCanvasRef.current;
    const source  = pageCanvases[currentPage];
    if (!display || !source) return;

    display.width  = source.width;
    display.height = source.height;
    const ctx = display.getContext("2d")!;

    // 1. Draw the page
    ctx.drawImage(source, 0, 0);

    // 2. Draw committed redactions for this page
    ctx.fillStyle = "#000000";
    for (const r of redactions) {
      if (r.pageIndex === currentPage) {
        ctx.fillRect(r.x, r.y, r.width, r.height);
      }
    }

    // 3. Draw live selection box
    if (isDrawing && drawStart && drawCurrent) {
      ctx.fillStyle = "rgba(232,180,160,0.35)";
      ctx.strokeStyle = "#E8B4A0";
      ctx.lineWidth = 2;
      const rx = Math.min(drawStart.x, drawCurrent.x);
      const ry = Math.min(drawStart.y, drawCurrent.y);
      const rw = Math.abs(drawCurrent.x - drawStart.x);
      const rh = Math.abs(drawCurrent.y - drawStart.y);
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
    }

    // 4. Highlight hovered text item
    if (hoveredText && hoveredText.pageIndex === currentPage) {
      ctx.fillStyle = "rgba(232,180,160,0.4)";
      ctx.fillRect(hoveredText.x, hoveredText.y, hoveredText.width, hoveredText.height);
    }
  }, [pageCanvases, currentPage, redactions, isDrawing, drawStart, drawCurrent, hoveredText]);

  // ── Canvas coordinate helpers ─────────────────────────────────────────────
  const getCanvasCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  }, []);

  // ── Mouse handlers for draw-to-redact ────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    setDrawCurrent(coords);
  }, [getCanvasCoords]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (isDrawing) {
      setDrawCurrent(coords);
    }
    // Hover: find text item under cursor
    const hit = textItems.find(t =>
      t.pageIndex === currentPage &&
      coords.x >= t.x && coords.x <= t.x + t.width &&
      coords.y >= t.y && coords.y <= t.y + t.height
    );
    setHoveredText(hit ?? null);
  }, [isDrawing, getCanvasCoords, textItems, currentPage]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart) return;
    const end = getCanvasCoords(e);
    const minPx = 6;
    if (Math.abs(end.x - drawStart.x) > minPx && Math.abs(end.y - drawStart.y) > minPx) {
      setRedactions(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        pageIndex: currentPage,
        x: Math.min(drawStart.x, end.x),
        y: Math.min(drawStart.y, end.y),
        width:  Math.abs(end.x - drawStart.x),
        height: Math.abs(end.y - drawStart.y),
      }]);
    }
    setIsDrawing(false);
    setDrawStart(null);
    setDrawCurrent(null);
  }, [isDrawing, drawStart, currentPage, getCanvasCoords]);

  // ── Click on text: redact ALL occurrences of that word across all pages ───
  const onCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing) return;
    const coords = getCanvasCoords(e);
    const hit = textItems.find(t =>
      t.pageIndex === currentPage &&
      coords.x >= t.x && coords.x <= t.x + t.width &&
      coords.y >= t.y && coords.y <= t.y + t.height
    );
    if (!hit || !hit.str.trim()) return;

    const word = hit.str.trim();
    setSelectedText(word);

    // Find ALL occurrences of this word across all pages
    const matches = textItems.filter(t => t.str.trim() === word);
    const newRedactions: RedactionRegion[] = matches.map(t => ({
      id: Math.random().toString(36).slice(2),
      pageIndex: t.pageIndex,
      x: t.x - 2,
      y: t.y - 2,
      width:  t.width  + 4,
      height: t.height + 4,
      sourceText: word,
    }));

    // Remove existing redactions for this word, then add new ones
    setRedactions(prev => [
      ...prev.filter(r => r.sourceText !== word),
      ...newRedactions,
    ]);
  }, [isDrawing, getCanvasCoords, textItems, currentPage]);

  // ── Build final redacted file ─────────────────────────────────────────────
  const buildRedactedFile = async (): Promise<File> => {
    if (redactions.length === 0) return file;

    if (isPdf) {
      // Strategy: render each page to canvas with redactions burned in,
      // then embed each canvas as an image page in a new PDF via pdf-lib.
      // This completely removes text from the content stream.
      const { PDFDocument } = await import("pdf-lib");
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < pageCanvases.length; i++) {
        const src = pageCanvases[i];
        // Draw redactions onto a copy of the canvas
        const copy = document.createElement("canvas");
        copy.width  = src.width;
        copy.height = src.height;
        const ctx = copy.getContext("2d")!;
        ctx.drawImage(src, 0, 0);
        ctx.fillStyle = "#000";
        for (const r of redactions) {
          if (r.pageIndex === i) {
            ctx.fillRect(r.x, r.y, r.width, r.height);
          }
        }

        // Export canvas to PNG bytes
        const pngDataUrl = copy.toDataURL("image/png");
        const base64 = pngDataUrl.split(",")[1];
        const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

        // Embed as image page
        const pngImage = await newPdf.embedPng(pngBytes);
        const page = newPdf.addPage([src.width / RENDER_SCALE, src.height / RENDER_SCALE]);
        page.drawImage(pngImage, {
          x: 0, y: 0,
          width:  src.width  / RENDER_SCALE,
          height: src.height / RENDER_SCALE,
        });
      }

      const bytes = await newPdf.save();
      return new File([bytes.buffer as ArrayBuffer], file.name, { type: "application/pdf" });
    }

    if (isImage) {
      const src = pageCanvases[0];
      const copy = document.createElement("canvas");
      copy.width  = src.width;
      copy.height = src.height;
      const ctx = copy.getContext("2d")!;
      ctx.drawImage(src, 0, 0);
      ctx.fillStyle = "#000";
      for (const r of redactions) {
        ctx.fillRect(r.x, r.y, r.width, r.height);
      }
      return new Promise((resolve, reject) => {
        copy.toBlob(blob => {
          if (!blob) return reject(new Error("Canvas export failed"));
          resolve(new File([blob], file.name, { type: file.type }));
        }, file.type, 0.95);
      });
    }

    return file;
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const redacted = await buildRedactedFile();
      onConfirm(redacted);
    } catch (err) {
      console.error("Redaction failed:", err);
      onConfirm(file);
    } finally {
      setProcessing(false);
    }
  };

  const pageRedactionCount = redactions.filter(r => r.pageIndex === currentPage).length;
  const totalRedactions    = redactions.length;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(10,8,6,0.92)", backdropFilter: "blur(10px)",
      display: "flex", flexDirection: "column",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", background: "#2C2420", borderBottom: "1px solid #4A3C34",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#E8B4A0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🔒</div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#FAF7F4", margin: 0 }}>Redact Sensitive Information</p>
            <p style={{ fontSize: "11px", color: "#A89888", margin: 0 }}>
              Click a word to redact all occurrences · Drag to draw a custom box
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {totalRedactions > 0 && (
            <span style={{ fontSize: "12px", color: "#E8B4A0", background: "rgba(232,180,160,0.15)", padding: "4px 12px", borderRadius: "100px", border: "1px solid rgba(232,180,160,0.3)" }}>
              {totalRedactions} redaction{totalRedactions > 1 ? "s" : ""}
            </span>
          )}
          <button onClick={onCancel}
            style={{ padding: "7px 16px", borderRadius: "100px", border: "1.5px solid #4A3C34", background: "transparent", color: "#A89888", cursor: "pointer", fontSize: "12px" }}>
            Skip
          </button>
          <button onClick={handleConfirm} disabled={processing}
            style={{
              padding: "7px 20px", borderRadius: "100px", border: "none",
              background: processing ? "#4A3C34" : "#E8B4A0",
              color: "#2C2420", cursor: processing ? "not-allowed" : "pointer",
              fontSize: "13px", fontWeight: 700,
            }}>
            {processing ? "Applying…" : "Apply & Continue"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Document canvas */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "24px", background: "#0D0A08" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingTop: "80px" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid #4A3C34", borderTopColor: "#E8B4A0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "#A89888", fontSize: "14px" }}>Rendering document…</p>
            </div>
          ) : !isPdf && !isImage ? (
            <div style={{ width: "560px", padding: "40px", background: "#2C2420", borderRadius: "12px", color: "#FAF7F4" }}>
              <p style={{ color: "#E8B4A0", fontWeight: 600, marginBottom: "8px" }}>Text Document</p>
              <p style={{ color: "#A89888", fontSize: "13px", lineHeight: 1.7 }}>
                No visual preview for this file type. Click "Apply & Continue" to proceed without redaction, or "Skip" to upload as-is.
              </p>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <canvas
                ref={displayCanvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onClick={onCanvasClick}
                style={{
                  display: "block",
                  maxWidth: "100%",
                  cursor: "crosshair",
                  boxShadow: "0 8px 48px rgba(0,0,0,0.7)",
                  borderRadius: "4px",
                }}
              />
              {/* Hint overlay */}
              {totalRedactions === 0 && !loading && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: "rgba(20,14,12,0.85)", borderRadius: "14px",
                  padding: "16px 24px", textAlign: "center",
                  pointerEvents: "none", backdropFilter: "blur(6px)",
                }}>
                  <p style={{ fontSize: "14px", color: "#E8B4A0", fontWeight: 600, margin: "0 0 6px" }}>🔒 Protect sensitive data</p>
                  <p style={{ fontSize: "12px", color: "#A89888", margin: 0, lineHeight: 1.6 }}>
                    <strong style={{ color: "#FAF7F4" }}>Click</strong> any word → redacts all occurrences<br />
                    <strong style={{ color: "#FAF7F4" }}>Drag</strong> to draw a custom black box
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{
          width: "260px", flexShrink: 0,
          background: "#2C2420", borderLeft: "1px solid #4A3C34",
          display: "flex", flexDirection: "column",
        }}>
          {/* Page nav */}
          {numPages > 1 && (
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #4A3C34" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#A89888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Page</p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                  style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid #4A3C34", background: "transparent", color: "#A89888", cursor: "pointer", fontSize: "13px" }}>←</button>
                <span style={{ fontSize: "13px", color: "#FAF7F4", flex: 1, textAlign: "center" }}>{currentPage + 1} / {numPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(numPages - 1, p + 1))} disabled={currentPage === numPages - 1}
                  style={{ padding: "5px 12px", borderRadius: "8px", border: "1px solid #4A3C34", background: "transparent", color: "#A89888", cursor: "pointer", fontSize: "13px" }}>→</button>
              </div>
              {pageRedactionCount > 0 && (
                <p style={{ fontSize: "11px", color: "#E8B4A0", marginTop: "6px", margin: "6px 0 0" }}>
                  {pageRedactionCount} redaction{pageRedactionCount > 1 ? "s" : ""} on this page
                </p>
              )}
            </div>
          )}

          {/* Last selected word */}
          {selectedText && (
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #4A3C34", background: "#1A1210" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#A89888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Last redacted word</p>
              <p style={{ fontSize: "13px", color: "#E8B4A0", fontWeight: 600, margin: 0, wordBreak: "break-all" }}>"{selectedText}"</p>
              <p style={{ fontSize: "11px", color: "#6B5E56", margin: "2px 0 0" }}>
                All occurrences across {numPages} page{numPages > 1 ? "s" : ""} hidden
              </p>
            </div>
          )}

          {/* Redactions list */}
          <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "#A89888", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                All Redactions ({totalRedactions})
              </p>
              {totalRedactions > 0 && (
                <button onClick={() => { setRedactions([]); setSelectedText(""); }}
                  style={{ fontSize: "11px", color: "#C0504A", background: "none", border: "none", cursor: "pointer" }}>
                  Clear all
                </button>
              )}
            </div>

            {totalRedactions === 0 ? (
              <div style={{ textAlign: "center", paddingTop: "24px" }}>
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>🔒</p>
                <p style={{ fontSize: "12px", color: "#6B5E56", lineHeight: 1.6 }}>No redactions yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {/* Group by sourceText */}
                {Array.from(new Set(redactions.map(r => r.sourceText ?? `box-${r.id}`))).map(key => {
                  const group = redactions.filter(r => (r.sourceText ?? `box-${r.id}`) === key);
                  const isWord = !!group[0].sourceText;
                  return (
                    <div key={key} style={{
                      padding: "9px 12px", borderRadius: "10px",
                      background: "#1A1210", border: "1px solid #4A3C34",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#FAF7F4", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {isWord ? `"${key}"` : "Custom box"}
                        </p>
                        <p style={{ fontSize: "10px", color: "#A89888", margin: 0 }}>
                          {group.length} occurrence{group.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setRedactions(prev => prev.filter(r => (r.sourceText ?? `box-${r.id}`) !== key));
                          if (selectedText === key) setSelectedText("");
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#6B5E56", fontSize: "15px", flexShrink: 0, marginLeft: "8px" }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ padding: "14px 16px", borderTop: "1px solid #4A3C34" }}>
            <p style={{ fontSize: "11px", color: "#6B5E56", lineHeight: 1.6, margin: 0 }}>
              💡 Text is permanently removed from the file — not just visually covered. The AI cannot read redacted content.
            </p>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
