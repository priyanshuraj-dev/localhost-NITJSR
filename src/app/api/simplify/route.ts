import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { getGeminiModel } from "@/lib/gemini";
import { SIMPLIFICATION_PROMPT } from "@/lib/prompts";
import { SimplifiedOutputSchema, SimplifiedOutput } from "@/lib/schemas";
import { connectDB } from "@/dbConfig/dbConfig";
import HistoryModel from "@/models/historyModel";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── Cloudinary helpers ────────────────────────────────────────────────────────

function uploadBuffer(buffer: Buffer, opts: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err || !result) return reject(err ?? new Error("Upload failed"));
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
}

async function uploadTextFile(text: string, title: string): Promise<string> {
  return uploadBuffer(Buffer.from(text, "utf-8"), {
    folder: "govt_docs/texts",
    resource_type: "raw",
    public_id: `text_${Date.now()}`,
    format: "txt",
    context: { caption: title },
  });
}

async function uploadOutputJson(json: string, title: string): Promise<string> {
  return uploadBuffer(Buffer.from(json, "utf-8"), {
    folder: "govt_docs/outputs",
    resource_type: "raw",
    public_id: `output_${Date.now()}`,
    format: "json",
    context: { caption: title },
  });
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function guessMime(url: string): string {
  const u = url.split("?")[0].toLowerCase();
  if (u.endsWith(".pdf"))  return "application/pdf";
  if (u.endsWith(".png"))  return "image/png";
  if (u.endsWith(".jpg") || u.endsWith(".jpeg")) return "image/jpeg";
  if (u.endsWith(".webp")) return "image/webp";
  return "application/pdf";
}

async function fetchBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  const mimeType = (!ct || ct.includes("octet-stream")) ? guessMime(url) : ct.split(";")[0].trim();
  const data = Buffer.from(await res.arrayBuffer()).toString("base64");
  return { data, mimeType };
}

// ── URL sanitizer ─────────────────────────────────────────────────────────────

function sanitize(data: SimplifiedOutput): SimplifiedOutput {
  // Only strip entries that aren't valid URLs at all — don't filter by domain
  // since Gemini is instructed to use real gov URLs and over-filtering causes blank sections
  const isUrl = (s: string) => {
    try { new URL(s.startsWith("http") ? s : "https://" + s); return true; }
    catch { return false; }
  };

  const cleanUrl = (s: string): string => {
    if (!s) return s;
    if (!s.startsWith("http")) return "https://" + s;
    return s.replace(/^http:\/\//i, "https://");
  };

  return {
    ...data,
    formLinks: (data.formLinks ?? [])
      .filter(f => f.url && isUrl(f.url))
      .map(f => ({ ...f, url: cleanUrl(f.url) })),
    portalLinks: (data.portalLinks ?? [])
      .filter(p => p.url && isUrl(p.url))
      .map(p => ({ ...p, url: cleanUrl(p.url) })),
    authority: {
      ...data.authority,
      website: data.authority.website && isUrl(data.authority.website)
        ? cleanUrl(data.authority.website)
        : null,
    },
  };
}

// ── POST /api/simplify ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, cloudinaryUrl, language = "en" } = body;

    if (!cloudinaryUrl && (!text || typeof text !== "string" || text.trim().length < 20)) {
      return NextResponse.json({ error: "Provide valid text (min 20 chars) or a file URL." }, { status: 400 });
    }

    // ── Call Gemini ──────────────────────────────────────────────────────────
    const model  = getGeminiModel();
    const prompt = SIMPLIFICATION_PROMPT(text?.trim() || "", language);

    const result = cloudinaryUrl
      ? await model.generateContent([{ inlineData: await fetchBase64(cloudinaryUrl) }, { text: prompt }])
      : await model.generateContent(prompt);

    const cleaned = result.response.text()
      .replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

    let parsed: unknown;
    try { parsed = JSON.parse(cleaned); }
    catch { return NextResponse.json({ error: "AI returned unexpected format. Try again." }, { status: 500 }); }

    const validated = SimplifiedOutputSchema.safeParse(parsed);
    if (!validated.success) {
      // Log the error but try to extract data anyway with a lenient approach
      console.error("Zod validation errors:", JSON.stringify(validated.error.flatten(), null, 2));
      // Attempt partial extraction — return what we can
      const partial = parsed as Record<string, unknown>;
      const fallback = SimplifiedOutputSchema.safeParse({
        ...partial,
        // Ensure required fields have defaults
        title: partial.title || "Document Analysis",
        summary: partial.summary || "",
        simplifiedText: partial.simplifiedText || "",
        steps: Array.isArray(partial.steps) ? partial.steps : [],
        requiredDocuments: Array.isArray(partial.requiredDocuments) ? partial.requiredDocuments : [],
        authority: partial.authority || { name: "Unknown", type: "Government" },
      });
      if (!fallback.success) {
        return NextResponse.json({ error: "AI response structure mismatch.", details: validated.error.flatten() }, { status: 500 });
      }
      const clean = sanitize(fallback.data);
      return NextResponse.json({ success: true, data: clean });
    }

    const clean = sanitize(validated.data);

    // ── Save to history ──────────────────────────────────────────────────────
    try {
      const token = req.cookies.get("logtok")?.value;
      if (!token) {
        console.log("[history] no logtok cookie — skipping");
      } else {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
        const outputJson = JSON.stringify(clean);

        // Upload input text to Cloudinary if no file was provided
        let savedInputUrl = cloudinaryUrl || "";
        if (!cloudinaryUrl && text?.trim()) {
          try { savedInputUrl = await uploadTextFile(text.trim(), clean.title); }
          catch (e) { console.error("[history] text upload failed:", e); }
        }

        // Always upload the output JSON to Cloudinary
        let outputUrl = "";
        try { outputUrl = await uploadOutputJson(outputJson, clean.title); }
        catch (e) { console.error("[history] output upload failed:", e); }

        await connectDB();
        const doc = await HistoryModel.create({
          email:            payload.email,
          nameDoc:          clean.title || "Document",
          uploadUrl:        savedInputUrl,
          outputUrl,
          inputText:        text?.trim() || "",
          language,
          simplifiedOutput: outputJson,
        });
        console.log("[history] saved:", doc._id.toString());
      }
    } catch (err) {
      console.error("[history] save error:", err);
    }

    return NextResponse.json({ success: true, data: clean });

  } catch (err: unknown) {
    console.error("Simplify error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
