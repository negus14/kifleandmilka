import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import { compare } from "bcryptjs";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login — I Think She Wifey" };

async function loginAction(formData: FormData) {
  "use server";

  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!slug || !password) return { error: "Please fill in all fields." };

  const site = await getSiteBySlug(slug);
  if (!site || !site.passwordHash) return { error: "Site not found." };

  const valid = await compare(password, site.passwordHash);
  if (!valid) return { error: "Invalid password." };

  await createSession(slug);
  redirect(`/dashboard/${slug}`);
}

export default async function LoginPage() {
  return <LoginForm action={loginAction} />;
}
