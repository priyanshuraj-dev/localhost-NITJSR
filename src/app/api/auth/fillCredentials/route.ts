import { connectDB } from "@/dbConfig/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/userModel";
import Eauth from "@/models/eAuthModel";
import bcrypt from "bcryptjs";


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // Retrieve the eAuthToken cookie
    const eAuthTokenCookie = req.cookies.get("eAuthToken");

    if (!eAuthTokenCookie) {
      const response = NextResponse.json(
        { error: "Authentication token missing"},
        { status: 401 }
      );
      return response;
    }

    const eAuthToken = eAuthTokenCookie.value;
    // Verify the eAuth token using JWT
    let decoded: any;
    try {
      decoded = await jwt.verify(eAuthToken, process.env.JWT_SECRET!);
    } catch (err: any) {
      const response = NextResponse.json(
        { error: "Invalid or expired authentication token",status: 401},
        { status: 401 }
      );
      response.cookies.delete("eAuthToken");
      return response;
    }

    const tokenEmail: string = decoded.email;
    if (!tokenEmail) {
      const response = NextResponse.json(
        { error: "Invalid token payload" ,status: 401},
        { status: 401 }
      );
      response.cookies.delete("eAuthToken");
      return response;
    }

    const eAuthRecord = await Eauth.findOne({ email: tokenEmail });
    if (!eAuthRecord) {
      const response = NextResponse.json(
        { error: "Authentication record not found" ,status: 401},
        { status: 401 }
      );
      response.cookies.delete("eAuthToken");
      return response;
    }

    if (eAuthRecord.token !== decoded.token) {
      const response = NextResponse.json(
        { error: "Token mismatch" ,status: 401},
        { status: 401 }
      );
      response.cookies.delete("eAuthToken");
      return response;
    }

    const { email, password } = await req.json();
    console.log("email:", email);
    if (email !== tokenEmail) {
      return NextResponse.json(
        { error: "Email mismatch",status: 401 },
        { status: 401 }
      );
    }
    const user = await User.findOne({ email: email });
    if (user) {
      const response = NextResponse.json(
        { error: "User already exists" ,status: 410},
        { status: 410 }
      );
      response.cookies.delete("eAuthToken");
      return response;
    }
    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = new User({
      email,
      password:hashedPassword,
    });
    await newUser.save();

    // Delete the temporary Eauth record and remove its cookie
    await Eauth.deleteOne({ email: tokenEmail });

    const logtokPayload = {
      email,
    };

    const logtok = await jwt.sign(logtokPayload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });
    // Set the logtok as a cookie and remove the eAuthToken cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully",status:200
      },
      { status: 200 }
    );
    response.cookies.set("logtok", logtok, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 2 * 60 * 60, // 2 hours in seconds
    });
    response.cookies.delete("eAuthToken");
    return response;
  } catch (error) {
    console.log("Error")
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
