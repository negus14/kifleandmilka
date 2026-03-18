import { z } from "zod";

/**
 * Shared validation schemas for API inputs.
 *
 * WHY ZOD?
 * 1. Validates AND narrows types in one step — after parsing, TypeScript knows
 *    the exact shape. No more `as any` or manual `typeof` checks.
 * 2. Strips unknown fields automatically — if someone sends extra fields
 *    (like `isAdmin: true`), they're silently dropped.
 * 3. Transforms data — we can trim whitespace, normalize emails, etc.
 *    during validation instead of doing it separately.
 *
 * WHY SANITIZE TEXT?
 * Text fields that get displayed in HTML can contain malicious scripts.
 * The `sanitizeText` helper strips HTML tags to prevent Stored XSS attacks.
 * Example: "<script>alert('hacked')</script>" becomes "alert('hacked')"
 */

// ─── Helpers ───

/** Strip HTML tags from a string to prevent XSS when displayed in the dashboard */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/** A Zod transform that trims whitespace and strips HTML tags */
const sanitizedText = z.string().transform((s) => stripHtml(s.trim()));

/** Email validation — more permissive than RFC 5322 but catches common typos */
const email = z
  .string()
  .email("Invalid email address")
  .transform((e) => e.toLowerCase().trim());

// ─── RSVP Schema ───

const guestSchema = z.object({
  name: sanitizedText.pipe(
    z.string().min(1, "Guest name is required").max(100, "Guest name is too long")
  ),
  // Accept both boolean and "yes"/"no" strings (some forms send strings),
  // then normalize to boolean so downstream code only handles one type.
  attending: z
    .union([z.boolean(), z.enum(["yes", "no"])])
    .transform((v) => v === true || v === "yes"),
  mealChoice: z.string().max(200).optional(),
  isHalal: z.boolean().optional(),
  dietaryPreference: z.string().max(500).optional(),
});

export const rsvpSchema = z.object({
  slug: z.string().min(1).max(100),
  email,
  phone: z.string().max(30).optional(),
  message: sanitizedText.pipe(z.string().max(2000)).optional(),
  guests: z.array(guestSchema).min(1, "At least one guest is required").max(10, "Maximum 10 guests"),
});

export type RSVPInput = z.infer<typeof rsvpSchema>;

// ─── Gift Contribution Schema ───

export const giftContributionSchema = z.object({
  slug: z.string().min(1).max(100),
  giftName: sanitizedText.pipe(z.string().min(1).max(200)),
  guestName: sanitizedText.pipe(z.string().max(100)).optional().default(""),
  amount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v ? String(v) : undefined))
    .pipe(
      z
        .string()
        .optional()
        .refine(
          (v) => !v || (!isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 100000),
          "Amount must be between 0 and 100,000"
        )
    ),
  currency: z.string().max(10).optional(),
  message: sanitizedText.pipe(z.string().max(1000)).optional(),
  paymentMethod: z.string().max(100).optional(),
});

export type GiftContributionInput = z.infer<typeof giftContributionSchema>;

// ─── Broadcast Schema ───

export const broadcastSchema = z.object({
  groupId: z.string().uuid(),
  subject: sanitizedText.pipe(z.string().max(500)).optional().default(""),
  body: sanitizedText.pipe(z.string().min(1, "Message body is required").max(10000)),
  channel: z.enum(["email", "sms"]).optional().default("email"),
});

export type BroadcastInput = z.infer<typeof broadcastSchema>;

// ─── Broadcast Group Schema ───

export const broadcastGroupSchema = z.object({
  name: sanitizedText.pipe(z.string().min(1, "Group name is required").max(200)),
  members: z.array(z.string().email()).optional().default([]),
});

export type BroadcastGroupInput = z.infer<typeof broadcastGroupSchema>;

// ─── Helper to parse and return errors ───

/**
 * Parse request body with a Zod schema. Returns either parsed data or
 * a formatted error string. Use in routes like:
 *
 *   const result = parseBody(rsvpSchema, body);
 *   if (typeof result === "string") return apiError(result, 400);
 *   // result is now fully typed RSVPInput
 */
export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T | string {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Return the first human-readable error
    const firstError = result.error.issues[0];
    const path = firstError.path.length > 0 ? `${firstError.path.join(".")}: ` : "";
    return `${path}${firstError.message}`;
  }
  return result.data;
}
