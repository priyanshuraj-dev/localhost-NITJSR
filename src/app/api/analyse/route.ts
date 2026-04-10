import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mammoth from "mammoth";
import { connectDB } from "@/dbConfig/dbConfig";
import HistoryModel from "@/models/historyModel";

export const runtime = "nodejs";

// ─── Supported Gemini inline MIME types ──────────────────────────────────────
const GEMINI_INLINE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function guessMimeFromUrl(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf"))  return "application/pdf";
  if (clean.endsWith(".png"))  return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".txt"))  return "text/plain";
  if (clean.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/pdf";
}

// ─── Fetch file — returns either inline data (PDF/image) or extracted text ───
async function resolveFileContent(
  url: string
): Promise<{ type: "inline"; base64: string; mimeType: string } | { type: "text"; content: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);

  const contentType = res.headers.get("content-type") || "";
  const isGeneric = !contentType || contentType.includes("octet-stream");
  const mimeType = isGeneric ? guessMimeFromUrl(url) : contentType.split(";")[0].trim();

  const buffer = Buffer.from(await res.arrayBuffer());

  // DOCX — extract text with mammoth (Gemini can't read DOCX natively)
  if (
    mimeType.includes("wordprocessingml") ||
    mimeType.includes("msword") ||
    url.toLowerCase().includes(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();
    if (!text) throw new Error("Could not extract text from Word document");
    return { type: "text", content: text };
  }

  // TXT — just decode
  if (mimeType === "text/plain" || url.toLowerCase().endsWith(".txt")) {
    return { type: "text", content: buffer.toString("utf-8").trim() };
  }

  // PDF / image — send as inline data directly to Gemini
  if (GEMINI_INLINE_TYPES.has(mimeType)) {
    return { type: "inline", base64: buffer.toString("base64"), mimeType };
  }

  // Fallback: try to send as PDF inline
  return { type: "inline", base64: buffer.toString("base64"), mimeType: "application/pdf" };
}

// ─── Gemini REST call ─────────────────────────────────────────────────────────
async function callGemini(
  prompt: string,
  filePart?: { base64: string; mimeType: string }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const parts: unknown[] = filePart
    ? [{ inlineData: { mimeType: filePart.mimeType, data: filePart.base64 } }, { text: prompt }]
    : [{ text: prompt }];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// ─── URL normalizer ───────────────────────────────────────────────────────────

function normalizeUrl(raw: string): string | null {
  if (!raw || typeof raw !== "string" || raw.trim() === "") return null;
  let url = raw.trim();
  if (!url.startsWith("http")) url = "https://" + url;
  url = url.replace(/^http:\/\//i, "https://");
  try { new URL(url); return url; } catch { return null; }
}

function filterLinks<T extends { url: string }>(links: T[]): T[] {
  return links.reduce<T[]>((acc, link) => {
    const clean = normalizeUrl(link.url);
    if (clean) acc.push({ ...link, url: clean });
    return acc;
  }, []);
}


function buildPrompt(content: string, language: string, isFile: boolean): string {
  const inputDesc = isFile
    ? `The user has uploaded a government document (provided above as file data). Carefully read and analyse its actual content.`
    : `The user has pasted the following government document text:\n\n${content}`;

  return `You are NyayaSetu, an AI assistant that helps Indian citizens understand government documents and legal procedures.

${inputDesc}

Respond ONLY with a valid JSON object (no markdown, no code fences) in this exact structure:
{
  "documentType": "string — type of document (e.g. RTI Application, Land Record, GST Notice)",
  "summary": "string — 2-3 sentence plain-language summary of what this document is about",
  "language": "${language}",
  "keyPoints": ["array of 3-6 important points the citizen must know"],
  "steps": [
    { "step": 1, "title": "string", "description": "string", "office": "string — which office/authority", "timeframe": "string — estimated time" }
  ],
  "requiredDocuments": ["array of documents the citizen needs to arrange"],
  "authorities": [
    { "name": "string", "role": "string", "contact": "string or empty" }
  ],
  "formLinks": [
    { "name": "string — form name e.g. Form 49A", "url": "string — direct URL to download or fill the form", "description": "string — what this form is for" }
  ],
  "portalLinks": [
    { "label": "string — portal name", "url": "string — real government portal URL if known, else empty" }
  ],
  "warnings": ["array of important deadlines, penalties, or cautions — can be empty array"],
  "estimatedTotalTime": "string — total estimated time to complete the procedure",
  "difficulty": "Easy | Moderate | Complex"
}

${language !== "English" ? `Translate all string values (summary, keyPoints, steps descriptions, etc.) to ${language}. Keep JSON keys in English.` : ""}

- formLinks: Use ONLY real, verified Indian government form URLs. Valid base domains:
    PAN: https://www.onlineservices.nsdl.com, https://www.utiitsl.com
    Income Tax: https://www.incometax.gov.in
    GST: https://www.gst.gov.in
    Passport: https://www.passportindia.gov.in
    Aadhaar: https://myaadhaar.uidai.gov.in
    EPF: https://unifiedportal-mem.epfindia.gov.in
    MCA: https://www.mca.gov.in
    DigiLocker: https://www.digilocker.gov.in
    RTI: https://rtionline.gov.in
    Voter ID: https://voters.eci.gov.in
  Only include a formLink if you are confident the URL path is real. If unsure of the exact path, use the portal homepage instead.
- portalLinks: Use ONLY the homepage or main service page of official portals from the domains above.
- If no relevant forms or portals exist, return empty arrays for those fields
Be accurate, helpful, and specific to Indian government procedures.`;
}

// ─── POST /api/analyse ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Auth
  const token = req.cookies.get("logtok")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  let payload: { email: string };
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // 2. Parse body
  let body: { cloudinaryUrl?: string; text?: string; fileName?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { cloudinaryUrl, text, fileName = "Document", language = "English" } = body;

  if (!cloudinaryUrl && !text?.trim()) {
    return NextResponse.json({ error: "Provide either cloudinaryUrl or text" }, { status: 400 });
  }

  // 3. Resolve file content — inline for PDF/images, extracted text for DOCX/TXT
  let filePart: { base64: string; mimeType: string } | undefined;
  let extractedText = text || "";

  if (cloudinaryUrl) {
    try {
      const resolved = await resolveFileContent(cloudinaryUrl);
      if (resolved.type === "inline") {
        filePart = { base64: resolved.base64, mimeType: resolved.mimeType };
      } else {
        extractedText = resolved.content;
      }
    } catch (err: any) {
      return NextResponse.json({ error: `Could not read uploaded file: ${err.message}` }, { status: 502 });
    }
  }

  const prompt = buildPrompt(extractedText, language, !!filePart);

  let rawResponse: string;
  try {
    rawResponse = await callGemini(prompt, filePart);
  } catch (err: any) {
    return NextResponse.json({ error: `AI error: ${err.message}` }, { status: 502 });
  }

  // 4. Parse AI JSON response
  let analysisResult: Record<string, unknown>;
  try {
    const cleaned = rawResponse.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    analysisResult = JSON.parse(cleaned);
  } catch {
    analysisResult = { raw: rawResponse, parseError: true };
  }

  // 4b. Validate & filter links — remove hallucinated or non-gov URLs
  if (!analysisResult.parseError) {
    analysisResult.formLinks = filterLinks((analysisResult.formLinks as { url: string }[] | undefined) ?? []);
    analysisResult.portalLinks = filterLinks((analysisResult.portalLinks as { url: string }[] | undefined) ?? []);
  }

  // 5. Save to History
  try {
    await connectDB();
    await HistoryModel.create({
      email: payload.email,
      nameDoc: fileName,
      uploadUrl: cloudinaryUrl || "",
      inputText: text || "",
      language,
      simplifiedOutput: JSON.stringify(analysisResult),
    });
  } catch (err) {
    // Don't fail the request if history save fails — just log it
    console.error("History save error:", err);
  }

  // 6. Return result
  return NextResponse.json({ success: true, result: analysisResult }, { status: 200 });
}
