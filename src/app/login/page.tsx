import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, getSession } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import { compare } from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login — ITSW" };

async function loginAction(formData: FormData) {
  "use server";

  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!slug || !password) return { error: "Please fill in all fields." };

  // Rate limit by slug: prevents brute-forcing any single site's password
  const { allowed } = await rateLimit(slug, { prefix: "rl:login", maxRequests: 5, windowSeconds: 60 });
  if (!allowed) {
    return { error: "Too many login attempts. Please wait a minute and try again." };
  }

  // Rate limit by IP: prevents spreading attempts across many slugs
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const { allowed: ipAllowed } = await rateLimit(ip, { prefix: "rl:login-ip", maxRequests: 20, windowSeconds: 60 });
  if (!ipAllowed) {
    return { error: "Too many login attempts. Please wait a minute and try again." };
  }

  const site = await getSiteBySlug(slug);
  if (!site || !site.passwordHash) return { error: "Site not found." };

  const valid = await compare(password, site.passwordHash);
  if (!valid) return { error: "Invalid password." };

  await createSession(slug);
  redirect(`/dashboard/${slug}`);
}

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(`/dashboard/${session.slug}`);
  }

  return <LoginForm action={loginAction} />;
}
