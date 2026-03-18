import { NextResponse } from "next/server";

/**
 * Standardized API response helpers.
 *
 * WHY THIS EXISTS:
 * Without this, every route invents its own format:
 *   - { ok: true, newSlug }
 *   - { success: true, rsvpId }
 *   - { broadcasts: [...] }
 *   - { error: "message" }
 *
 * The frontend has to handle all variations. One typo (ok vs success)
 * causes a silent bug. A standard format means:
 *   - Success: always has `success: true` + optional data spread in
 *   - Error: always has `error: string` + correct HTTP status code
 *
 * USAGE:
 *   return apiOk({ rsvps });           // { success: true, rsvps: [...] }
 *   return apiError("Not found", 404); // { error: "Not found" }, status 404
 */

export function apiOk<T extends Record<string, unknown>>(data?: T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
