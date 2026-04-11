import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/dbConfig/dbConfig";
import HistoryModel from "@/models/historyModel";

export const runtime = "nodejs";

function getEmail(req: NextRequest): string | null {
  try {
    const token = req.cookies.get("logtok")?.value;
    if (!token) return null;
    const p = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    return p.email;
  } catch { return null; }
}

// GET /api/history
export async function GET(req: NextRequest) {
  const email = getEmail(req);
  if (!email) return NextResponse.json({ error: "Not logged in", success: false }, { status: 401 });

  await connectDB();

  const entries = await HistoryModel.find({ email })
    .sort({ createdAt: -1 })
    .select("_id nameDoc uploadUrl outputUrl language createdAt simplifiedOutput")
    .lean();

  const data = entries.map(e => ({
    _id:              e._id.toString(),
    nameDoc:          e.nameDoc,
    uploadUrl:        e.uploadUrl  || "",
    outputUrl:        (e as any).outputUrl || "",
    language:         e.language,
    createdAt:        (e.createdAt as Date).toISOString(),
    simplifiedOutput: e.simplifiedOutput || "",
  }));

  return NextResponse.json({ success: true, data });
}

// DELETE /api/history?id=xxx
export async function DELETE(req: NextRequest) {
  const email = getEmail(req);
  if (!email) return NextResponse.json({ error: "Not logged in", success: false }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id", success: false }, { status: 400 });

  await connectDB();
  await HistoryModel.deleteOne({ _id: id, email });
  return NextResponse.json({ success: true });
}
