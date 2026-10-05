import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "sendtoolkit-storefront",
    checkoutReady: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_CORE),
    databaseReady: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  });
}
