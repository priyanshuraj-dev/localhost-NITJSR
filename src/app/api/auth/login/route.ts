import { connectDB } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
// import { rateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    const user = await User.findOne({ email: email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid Credentials"},
        { status: 400 }
      );
    }
    const isValid = await bcrypt.compare(password,user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Credentials"},
        { status: 400 }
      );
    }
    const logtokPayload = {
      email: user.email,
    };
    const secret = process.env.JWT_SECRET || "def";
    const logtok =  jwt.sign(logtokPayload,secret, {
      expiresIn: "2h",
    });
    const response = NextResponse.json(
      {
        message: "User logged in successfully"
      },
      { status: 200 }
    );

    response.cookies.set("logtok", logtok, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 2  * 60 * 60, // 2 hours in seconds
    });

    return response;
  } catch (error) {
    console.error("Error in user Login:", error);
    return NextResponse.json(
      { error: "Internal Server Error"},
      { status: 500 }
    );
  }
}
