import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

async function markEvent(eventId: string, status: "processed" | "failed", errorMessage?: string) {
  const supabase = createAdminClient();
  await supabase
    .from("stripe_webhook_events")
    .update({
      status,
      processed_at: new Date().toISOString(),
      error_message: errorMessage || null
    })
    .eq("stripe_event_id", eventId);
}

async function recordPaidOrder(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email || session.customer_email;
  const sku = session.metadata?.sku;

  if (!email || !sku) throw new Error("Checkout is missing fulfillment metadata.");

  let attribution: Record<string, string> = {};
  try {
    attribution = session.metadata?.attribution ? JSON.parse(session.metadata.attribution) : {};
  } catch {
    attribution = {};
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("record_paid_order", {
    p_customer_email: email,
    p_stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    p_session_id: session.id,
    p_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    p_currency: session.currency || "usd",
    p_subtotal: session.amount_subtotal || 0,
    p_discount: session.total_details?.amount_discount || 0,
    p_tax: session.total_details?.amount_tax || 0,
    p_total: session.amount_total || 0,
    p_sku: sku,
    p_source: session.metadata?.source || "sendtoolkit-storefront",
    p_utm_source: attribution.utm_source || null,
    p_utm_medium: attribution.utm_medium || null,
    p_utm_campaign: attribution.utm_campaign || null,
    p_utm_content: attribution.utm_content || null,
    p_utm_term: attribution.utm_term || null,
    p_ref_code: session.metadata?.ref_code || null
  });

  if (error) throw error;
}

async function recordRefund(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : null;

  if (!paymentIntentId) return;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      refunded_cents: charge.amount_refunded || 0,
      status: charge.refunded ? "refunded" : "partially_refunded",
      refunded_at: new Date().toISOString()
    })
    .eq("stripe_payment_intent_id", paymentIntentId);

  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const { STRIPE_WEBHOOK_SECRET } = getServerEnv();

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error: insertError } = await supabase
    .from("stripe_webhook_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event,
      status: "received"
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "event_log_failed" }, { status: 500 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await recordPaidOrder(event.data.object as Stripe.Checkout.Session);
    }

    if (event.type === "charge.refunded") {
      await recordRefund(event.data.object as Stripe.Charge);
    }

    await markEvent(event.id, "processed");
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    await markEvent(event.id, "failed", message);
    return NextResponse.json({ error: "processing_failed" }, { status: 500 });
  }
}
