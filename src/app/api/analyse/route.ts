import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/dbConfig/dbConfig";
import HistoryModel from "@/models/historyModel";

export const runtime = "nodejs";

// ─── Fetch file from Cloudinary and return base64 + mimeType ─────────────────
/** Guess MIME type from the file URL/extension when content-type is unreliable */
function guessMimeFromUrl(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf"))  return "application/pdf";
  if (clean.endsWith(".png"))  return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".txt"))  return "text/plain";
  if (clean.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/pdf"; // safe default for govt docs
}

async function fetchFileAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file from Cloudinary: ${res.status}`);

  const contentType = res.headers.get("content-type") || "";
  // Cloudinary often returns "application/octet-stream" for PDFs stored as raw —
  // fall back to guessing from the URL extension in that case.
  const isGeneric = !contentType || contentType.includes("octet-stream");
  const mimeType = isGeneric ? guessMimeFromUrl(url) : contentType.split(";")[0].trim();

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return { base64, mimeType };
}

// ─── Gemini REST call — supports both text-only and inline file parts ─────────
async function callGemini(
  prompt: string,
  filePart?: { base64: string; mimeType: string }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  // Build parts: if we have a real file, send it as inlineData so Gemini can read it
  const parts: unknown[] = filePart
    ? [
        { inlineData: { mimeType: filePart.mimeType, data: filePart.base64 } },
        { text: prompt },
      ]
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

// ─── Prompt builder ───────────────────────────────────────────────────────────
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
  "portalLinks": [
    { "label": "string", "url": "string — real government portal URL if known, else empty" }
  ],
  "warnings": ["array of important deadlines, penalties, or cautions — can be empty array"],
  "estimatedTotalTime": "string — total estimated time to complete the procedure",
  "difficulty": "Easy | Moderate | Complex"
}

${language !== "English" ? `Translate all string values (summary, keyPoints, steps descriptions, etc.) to ${language}. Keep JSON keys in English.` : ""}

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

  // 3. Build prompt and call Gemini
  // For file uploads: fetch the actual file bytes and send as inline data so
  // Gemini can truly read the document instead of guessing from the URL.
  let filePart: { base64: string; mimeType: string } | undefined;
  if (cloudinaryUrl) {
    try {
      filePart = await fetchFileAsBase64(cloudinaryUrl);
    } catch (err: any) {
      return NextResponse.json({ error: `Could not fetch uploaded file: ${err.message}` }, { status: 502 });
    }
  }

  const prompt = buildPrompt(text || "", language, !!cloudinaryUrl);

  let rawResponse: string;
  try {
    rawResponse = await callGemini(prompt, filePart);
  } catch (err: any) {
    return NextResponse.json({ error: `AI error: ${err.message}` }, { status: 502 });
  }

  // 4. Parse AI JSON response
  let analysisResult: Record<string, unknown>;
  try {
    // Strip any accidental markdown fences
    const cleaned = rawResponse.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    analysisResult = JSON.parse(cleaned);
  } catch {
    // Return raw text if JSON parse fails
    analysisResult = { raw: rawResponse, parseError: true };
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
      details: JSON.stringify(analysisResult),
    });
  } catch (err) {
    // Don't fail the request if history save fails — just log it
    console.error("History save error:", err);
  }

  // 6. Return result
  return NextResponse.json({ success: true, result: analysisResult }, { status: 200 });
}
