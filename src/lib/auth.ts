import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getSiteBySlug } from "./data/sites";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-in-production"
);

const COOKIE_NAME = "itsw_session";

interface SessionPayload {
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
