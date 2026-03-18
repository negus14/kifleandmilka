import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { getSiteBySlug } from "./data/sites";

// Fail fast if AUTH_SECRET is missing — never fall back to a hardcoded secret.
// A missing secret means anyone who reads the source code can forge session tokens.
if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required. " +
    "Set it in .env.local (dev) or Railway env vars (prod). " +
    "Generate one with: openssl rand -base64 32"
  );
}

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

const COOKIE_NAME = "itsw_session";

export interface SessionPayload {
  slug: string;
  isPaid: boolean;
}

export async function createSession(slug: string) {
  const site = await getSiteBySlug(slug, true);
  const isPaid = !!site?.isPaid;

  const token = await new SignJWT({ slug, isPaid })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Validate payload structure
    if (typeof payload.slug !== "string" || !payload.slug) {
      return null;
    }

    return { slug: payload.slug, isPaid: !!payload.isPaid };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Verify the user owns the given slug. Returns the session on success,
 * or a 401 NextResponse on failure. Use in API routes like:
 *
 *   const auth = await requireAuth(slug);
 *   if (auth instanceof NextResponse) return auth;
 *   // auth is now a valid SessionPayload
 */
export async function requireAuth(slug: string): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session || session.slug !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

/**
 * Same as requireAuth but also checks the user has a paid account.
 * Returns 403 with a clear upgrade message if not paid.
 */
export async function requirePaidAuth(slug: string): Promise<SessionPayload | NextResponse> {
  const result = await requireAuth(slug);
  if (result instanceof NextResponse) return result;
  if (!result.isPaid) {
    return NextResponse.json(
      { error: "This feature requires a premium account. Upgrade to unlock." },
      { status: 403 }
    );
  }
  return result;
}
