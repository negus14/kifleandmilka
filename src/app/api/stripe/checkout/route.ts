import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSession } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";

export const dynamic = "force-dynamic";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia" as any,
  });
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      console.warn("[Stripe] Checkout missing configuration. Skipping.");
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const site = await getSiteBySlug(session.slug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (site.isPaid) {
      return NextResponse.json({ error: "Site is already paid" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Wedding Website - ${site.slug}`,
              description: "Full access to ithinkshewifey.com features",
            },
            unit_amount: 2900, // $29.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${site.slug}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${site.slug}?canceled=true`,
      metadata: {
        siteSlug: site.slug,
      },
      customer_email: site.contactEntries?.[0]?.email || undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("[Stripe] Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
