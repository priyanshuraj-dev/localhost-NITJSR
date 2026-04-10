import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const eAuthToken = request.cookies.get("eAuthToken")?.value || "";
  const logTok = request.cookies.get("logtok")?.value || "";

  const isFillCredentials = path.startsWith("/fillCredentials");
  const isProtected = path.startsWith("/dashboard");

  const isAuthPage =
    path.startsWith("/login") || path.startsWith("/register");

  // // 1. fillcredentials requires eAuthToken
  if (isFillCredentials && !eAuthToken) {
    return NextResponse.redirect(new URL("/register", request.url));
  }

  // // 2. payreg & dashboard require logTok
  if (isProtected && !logTok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // // 3. logged in users can't access login/register
  if (isAuthPage && logTok) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/fillCredentials",
    "/dashboard",
    "/login",
    "/register",
  ],
};