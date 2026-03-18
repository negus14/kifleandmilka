import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug } from "@/lib/data/sites";
import { createGiftContribution } from "@/lib/data/gift-contributions";
import { buildPaymentUrl } from "@/lib/payment-urls";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import { giftContributionSchema, parseBody } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 gifts per IP per minute
    const ip = getClientIP(request);
    const { allowed } = await rateLimit(ip, { prefix: "rl:gift", maxRequests: 10, windowSeconds: 60 });
    if (!allowed) {
      return NextResponse.json({ error: "Too many submissions. Please wait." }, { status: 429 });
    }

    // Validate & sanitize — Zod strips HTML, enforces max lengths,
    // caps amount at 100,000, and normalizes types
    const body = await request.json();
    const parsed = parseBody(giftContributionSchema, body);
    if (typeof parsed === "string") {
      return NextResponse.json({ error: parsed }, { status: 400 });
    }

    const { slug, giftName, guestName, amount, currency: bodyCurrency, message, paymentMethod } = parsed;

    const site = await getSiteBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const currency = bodyCurrency || site.giftCurrency || "GBP";

    const contribution = await createGiftContribution(slug, {
      giftName,
      guestName: guestName || "",
      amount: amount || undefined,
      currency,
      message: message || undefined,
      paymentMethod: paymentMethod || undefined,
    });

    // Build redirect URL if a payment method was selected
    let redirectUrl: string | null = null;
    if (paymentMethod) {
      const link = site.giftPaymentLinks?.find(l => l.label === paymentMethod);
      if (link?.url && amount) {
        redirectUrl = buildPaymentUrl(link.url, amount);
      } else if (link?.url) {
        redirectUrl = link.url;
      }

      if (!redirectUrl) {
        const bank = site.giftBankDetails?.find(b => b.label === paymentMethod);
        if (bank?.payLink && amount) {
          redirectUrl = buildPaymentUrl(bank.payLink, amount);
        } else if (bank?.payLink) {
          redirectUrl = bank.payLink;
        }
      }
    }

    return NextResponse.json({ success: true, contributionId: contribution.id, redirectUrl });
  } catch (error) {
    console.error("Gift Contribution Error:", error);
    return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
  }
}
