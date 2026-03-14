import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { sites } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSiteBySlug, updateSite } from "@/lib/data/sites";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`[Stripe] Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const siteSlug = session.metadata?.siteSlug;

    if (siteSlug) {
      console.log(`[Stripe] Payment completed for site: ${siteSlug}`);
      
      const site = await getSiteBySlug(siteSlug, true);
      if (site) {
        await updateSite(siteSlug, {
          ...site,
          isPaid: new Date(),
          stripeCustomerId: session.customer as string,
        });
        console.log(`[Stripe] Site ${siteSlug} marked as paid.`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
