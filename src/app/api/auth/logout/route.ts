import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("logtok")?.value;
    if (!token) {
      const response = NextResponse.json(
        { error: "Login token missing" },
        { status: 401 }
      );
      return response;
    }
    const response = NextResponse.json(
      { error: "Successfully log out" },
      { status: 200 }
    );
    response.cookies.delete("logtok");
    return response;
  } catch (error) {
    const response = NextResponse.json(
      { error: "Error while getting the current user" },
      { status: 401 }
    );
    return response;
  }
}
