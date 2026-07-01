import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/dbConfig/dbConfig";
import HistoryModel from "@/models/historyModel";

export const runtime = "nodejs";

function getEmail(req: NextRequest): string | null {
  try {
    const token = req.cookies.get("logtok")?.value;
    if (!token) return null;

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { email: string };

    return payload.email;
  } catch {
    return null;
  }
}

// GET /api/documents
export async function GET(req: NextRequest) {
  const email = getEmail(req);

  if (!email) {
    return NextResponse.json(
      {
        success: false,
        error: "Not logged in",
      },
      { status: 401 }
    );
  }

  await connectDB();

  const docs = await HistoryModel.find({ email })
    .sort({ createdAt: -1 })
    .select("nameDoc uploadUrl language createdAt")
    .lean();

  const data = docs.map((doc) => ({
    id: doc._id.toString(),
    nameDoc: doc.nameDoc,
    uploadUrl: doc.uploadUrl || "",
    language: doc.language,
    createdAt: (doc.createdAt as Date).toISOString(),
  }));

  return NextResponse.json({
    success: true,
    data,
  });
}