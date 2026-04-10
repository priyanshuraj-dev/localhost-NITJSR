import { NextRequest, NextResponse } from "next/server";
import { getGeminiModel } from "@/lib/gemini";
import { CHAT_CONTEXT_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { originalText, simplifiedOutput, question } = body;

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Please provide a question." },
        { status: 400 }
      );
    }

    const model = getGeminiModel();
    const prompt = CHAT_CONTEXT_PROMPT(
      originalText || "",
      JSON.stringify(simplifiedOutput || {}),
      question.trim()
    );

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    return NextResponse.json({ success: true, answer });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}