import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { products } from "@/lib/products";
import { publicEnv } from "@/lib/env";
import { getStripe, getStripePriceId } from "@/lib/stripe/server";

const inputSchema = z.object({
  sku: z.enum(["client-firefighter-core", "client-firefighter-lite"])
});

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    const product = Object.values(products).find((item) => item.sku === input.sku);

    if (!product) {
      return NextResponse.json({ error: "invalid_product" }, { status: 400 });
    }

    const priceId = getStripePriceId(input.sku);
    if (!priceId) {
      return NextResponse.json({ error: "checkout_not_configured" }, { status: 503 });
    }

    const stripe = getStripe();
    const taxEnabled = process.env.STRIPE_TAX_ENABLED === "true";
    const cookieStore = await cookies();
    const firstTouch = cookieStore.get("st_attribution")?.value;
    const referral = cookieStore.get("st_ref")?.value;

    const lineItems = [{ price: priceId, quantity: 1 }];

    const requestId =
      request.headers.get("Idempotency-Key") ||
      request.headers.get("x-request-id") ||
      crypto.randomUUID();

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: lineItems,
        automatic_tax: { enabled: taxEnabled },
        managed_payments: { enabled: false },
        customer_creation: "always",
        allow_promotion_codes: true,
        billing_address_collection: taxEnabled ? "required" : "auto",
        success_url: publicEnv.NEXT_PUBLIC_SITE_URL + "/thank-you?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: publicEnv.NEXT_PUBLIC_SITE_URL + "/products/" + product.slug,
        integration_identifier: "sendtoolkit_web_kpraxmvt",
        metadata: {
          sku: product.sku,
          source: "sendtoolkit-storefront",
          attribution: firstTouch || "",
          ref_code: referral || ""
        }
      },
      { idempotencyKey: "sendtoolkit_checkout_" + requestId }
    );

    if (!session.url) {
      return NextResponse.json({ error: "checkout_session_missing_url" }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    console.error("checkout_error", error);
    return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
  }
}
