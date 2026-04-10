import { connectDB } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";

// this route is to get the user details
export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const token = req.cookies.get("logtok")?.value;
    if (!token) {
      return NextResponse.json(
        {
          message: "No login token",
          data: null,
        },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      const res = NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
      res.cookies.delete("logtok");
      return res;
    }
    // with the help of lean,it returns a plain js object
    const user = await User.findOne({ email: (decoded as any).email })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error while fetching user" },
      { status: 500 }
    );
  }
}