import { google } from "googleapis";
import { connectDB } from "@/dbConfig/dbConfig";
import Eauth from "@/models/eAuthModel";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Extract the "code" from the query params , which is sent by google act as temporary authorization token
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    // through the tokens, server fetch user data from google
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data } = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
    );
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { error: "No email returned from Google" },
        { status: 400 }
      );
    }

    //same as login start
    const user = await User.findOne({ email: email });
    if (user) {

        const logtokPayload = {
          email: user.email
        };
        const secret = process.env.JWT_SECRET || "def";
        const logtok = jwt.sign(logtokPayload, secret, { expiresIn: "2h" });

        const response = NextResponse.redirect(
          new URL("/dashboard", req.url)
        );
        response.cookies.set("logtok", logtok, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 2 * 60 * 60, // 2 hours in seconds
        });
        return response;
    }

    //now creating the instance for the proper authentication if user not exist
    let instance = await Eauth.findOne({ email });
    if (!instance) {
      instance = new Eauth({ email, token: tokens.access_token });
      await instance.save();
    } else {
      instance.token = tokens.access_token || "xyz";
      await instance.save();
    }

    const payload = { email, token: instance.token };
    const secret = process.env.JWT_SECRET || "def";
    const jwtToken = jwt.sign(payload, secret, { expiresIn: "1h" });

    const response = NextResponse.redirect(
      new URL("/fillCredentials", req.url)
    );

    response.cookies.set("eAuthToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1 , // 1 hours in seconds
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
