import { NextRequest, NextResponse } from "next/server";
import { getTokens, oauth2Client } from "@/lib/google-auth";
import { createSession } from "@/lib/auth";
import pool from "@/lib/db";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state"); // This stores our 'slug'

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const tokens = await getTokens(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return NextResponse.redirect(new URL("/login?error=no_email", request.url));
    }

    // 1. Find site: either by 'state' (slug) or by matching email
    let site: any;
    if (state) {
      const { rows } = await pool.query("SELECT slug, data FROM sites WHERE slug = $1", [state]);
      site = rows[0];
    }

    if (!site) {
      const { rows } = await pool.query(
        "SELECT slug, data FROM sites WHERE data->'contactEntries' @> $1::jsonb",
        [JSON.stringify([{ email: userInfo.email }])]
      );
      site = rows[0];
    }

    if (!site) {
      return NextResponse.redirect(new URL("/login?error=not_authorized", request.url));
    }

    // 2. Update site data with google info
    const updatedData = {
      ...site.data,
      googleId: userInfo.id,
      googleTokens: {
        ...(site.data.googleTokens || {}),
        ...tokens,
        // Ensure we keep the refresh token if Google didn't send a new one
        refresh_token: tokens.refresh_token || site.data.googleTokens?.refresh_token
      }
    };

    await pool.query(
      "UPDATE sites SET data = $1, updated_at = NOW() WHERE slug = $2",
      [updatedData, site.slug]
    );

    // 3. Create session and redirect
    await createSession(site.slug);
    
    // If we were connecting sheets, redirect back to dashboard with a success param
    return NextResponse.redirect(new URL(`/dashboard/${site.slug}?google_connected=true`, request.url));
  } catch (err: any) {
    console.error("OAuth Callback Error:", err);
    return NextResponse.redirect(new URL(`/login?error=auth_failed`, request.url));
  }
}
