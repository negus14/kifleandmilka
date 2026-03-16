import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug } from "@/lib/data/sites";
import { createGiftContribution } from "@/lib/data/gift-contributions";
import { buildPaymentUrl } from "@/lib/payment-urls";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, giftName, guestName, amount, currency: bodyCurrency, message, paymentMethod } = body;

    if (!slug || !giftName || !guestName) {
      return NextResponse.json({ error: "Slug, gift name, and your name are required" }, { status: 400 });
    }

    if (guestName.length > 100) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }

    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const site = await getSiteBySlug(slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const currency = bodyCurrency || site.giftCurrency || "GBP";

    const contribution = await createGiftContribution(slug, {
      giftName,
      guestName,
      amount: amount || undefined,
      currency,
      message: message || undefined,
      paymentMethod: paymentMethod || undefined,
    });

    // Build redirect URL if a payment method was selected
    let redirectUrl: string | null = null;
    if (paymentMethod) {
      // Check payment links
      const link = site.giftPaymentLinks?.find(l => l.label === paymentMethod);
      if (link?.url && amount) {
        redirectUrl = buildPaymentUrl(link.url, amount);
      } else if (link?.url) {
        redirectUrl = link.url;
      }

      // Check bank details pay links
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
