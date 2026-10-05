# Milestone B checkpoint

Foundation and money-layer code are ready for preview validation.

Included:
- Next.js App Router storefront
- typed Core and Lite products
- free mini-pack route
- legal routes
- Supabase schema migrations
- Stripe Checkout session route
- signed Stripe webhook route
- idempotent order recording RPC
- refund state handling
- UTM/referral cookie capture
- checkout UI safety while Stripe is unconfigured

External connections still required:
- dedicated SendToolkit Supabase project
- intended SendToolkit Stripe account and Price IDs

## Runtime wiring checkpoint

- Stripe sandbox Core and Lite products created
- Stripe sandbox webhook destination created
- Supabase storefront schema applied to SendToolkit project
- Vercel sandbox Stripe secrets scoped to preview/development
- Supabase service-role secret available server-side
- Automatic Stripe Tax remains disabled until tax setup is intentionally chosen

## Sandbox domain

The storefront-v1 branch is mapped to `https://sandbox.sendtoolkit.com` for unprotected Stripe sandbox webhook delivery and end-to-end testing. Production remains on `main`.
