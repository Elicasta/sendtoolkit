import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";

export function getStripe() {
  const { STRIPE_SECRET_KEY } = getServerEnv();
  if (!STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
  return new Stripe(STRIPE_SECRET_KEY);
}

export function getStripePriceId(sku: string) {
  const env = getServerEnv();

  if (sku === "client-firefighter-core") return env.STRIPE_PRICE_CORE;
  if (sku === "client-firefighter-lite") return env.STRIPE_PRICE_LITE;
  if (sku === "contract-clause-pack") return env.STRIPE_PRICE_BUMP;

  return undefined;
}
