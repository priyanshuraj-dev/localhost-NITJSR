import { SignJWT, jwtVerify, JWTPayload } from "jose";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JWTUserPayload {
  sub: string;       // Google's unique user ID (Google sub)
  email: string;     // User's Google email
  name?: string;     // Display name from Google profile
  picture?: string;  // Avatar URL from Google profile
  iat?: number;      // Issued at (auto-set by jose)
  exp?: number;      // Expiry (auto-set by jose)
}

// ─── Secret ───────────────────────────────────────────────────────────────────

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

// ─── Sign JWT ─────────────────────────────────────────────────────────────────

/**
 * Signs a JWT after Google OAuth callback.
 * Call this once you have verified the Google ID token and extracted user info.
 *
 * @example
 * const token = await signJWT({ sub: googleSub, email, name, picture });
 * // Set as HttpOnly cookie or return to client
 */
export async function signJWT(payload: JWTUserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")   // Token valid for 7 days
    .setIssuer("nyayasetu")
    .setAudience("nyayasetu-client")
    .sign(getSecret());
}

// ─── Verify JWT ───────────────────────────────────────────────────────────────

/**
 * Verifies the JWT from the Authorization header.
 * Throws if the token is missing, expired, or tampered with.
 * Used inside API routes like /api/cloudinary/upload.
 *
 * @example
 * const payload = await verifyJWT(token);
 * // payload.sub  → Google user ID
 * // payload.email → user email
 */
export async function verifyJWT(token: string): Promise<JWTUserPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "nyayasetu",
    audience: "nyayasetu-client",
  });

  // Validate required fields exist on the payload
  if (!payload.sub || !payload.email) {
    throw new Error("JWT payload is missing required fields (sub, email).");
  }

  return payload as JWTPayload & JWTUserPayload;
}

// ─── Extract from Request Header ─────────────────────────────────────────────

/**
 * Convenience helper — extracts and verifies the JWT from an
 * Authorization: Bearer <token> header in one call.
 * Returns null instead of throwing, for use in middleware.
 *
 * @example
 * const user = await getUserFromHeader(req.headers.get("authorization"));
 * if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
 */
export async function getUserFromHeader(
  authHeader: string | null
): Promise<JWTUserPayload | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    return await verifyJWT(token);
  } catch {
    return null;
  }
}