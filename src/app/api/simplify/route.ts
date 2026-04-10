import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { SIMPLIFICATION_PROMPT } from "@/lib/prompts";
import { SimplifiedOutputSchema } from "@/lib/schemas";

export const runtime = "nodejs";

function guessMimeFromUrl(url: string): string {
  const clean = url.split("?")[0].toLowerCase();
  if (clean.endsWith(".pdf"))  return "application/pdf";
  if (clean.endsWith(".png"))  return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  return "application/pdf";
}

async function fetchFileAsBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  const isGeneric = !contentType || contentType.includes("octet-stream");
  const mimeType = isGeneric ? guessMimeFromUrl(url) : contentType.split(";")[0].trim();
  const buffer = await res.arrayBuffer();
  return { base64: Buffer.from(buffer).toString("base64"), mimeType };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, cloudinaryUrl, language = "en" } = body;

    if (!cloudinaryUrl && (!text || typeof text !== "string" || text.trim().length < 20)) {
      return NextResponse.json(
        { error: "Please provide valid text (minimum 20 characters) or a file URL." },
        { status: 400 }
      );
    }

    const model = getGeminiModel();
    const prompt = SIMPLIFICATION_PROMPT(text?.trim() || "", language);

    let result;
    if (cloudinaryUrl) {
      const { base64, mimeType } = await fetchFileAsBase64(cloudinaryUrl);
      result = await model.generateContent([
        { inlineData: { mimeType, data: base64 } },
        { text: prompt },
      ]);
    } else {
      result = await model.generateContent(prompt);
    }
    const rawText = result.response.text();

    // Strip markdown fences
    const cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    console.log("=== RAW GEMINI RESPONSE ===");
    console.log(cleaned);
    console.log("===========================");

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw response:", rawText);
      return NextResponse.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 500 }
      );
    }

    const validated = SimplifiedOutputSchema.safeParse(parsed);
    if (!validated.success) {
      // Log exact fields that failed
      console.error("=== ZOD ERRORS ===");
      console.error(JSON.stringify(validated.error.flatten(), null, 2));
      console.error("==================");

      return NextResponse.json(
        {
          error: "AI response did not match expected structure.",
          details: validated.error.flatten(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: validated.data });
  } catch (err: unknown) {
    console.error("Simplify API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}