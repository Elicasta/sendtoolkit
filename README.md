# SendToolkit storefront

Next.js storefront for **The Client Firefighter** and future SendToolkit products.

## Branch

Active build branch: `storefront-v1`

Production remains on `main` until the storefront passes end-to-end purchase and delivery testing.

## Stack

- Next.js App Router + TypeScript
- Vercel
- Stripe Checkout
- Supabase Postgres
- Resend
- PostHog

## Products

- Core: $37
- Lite: $19
- Free mini pack: 10–12 templates

Product definitions live in `lib/products.ts`.

## Database

The initial schema is committed at:

`supabase/migrations/20261005_storefront_foundation.sql`

The migration has not been applied yet because no SendToolkit Supabase project exists on the connected Supabase account. Do not apply it to another project.

## Checkout safety

Paid checkout buttons remain disabled until the intended Stripe account and product Price IDs are connected. The storefront does not fall back to the inactive Stan Store.

## Legal

Current routes:

- `/privacy`
- `/terms`
- `/refund-policy`
- `/disclaimer`

The refund page intentionally remains marked incomplete until the actual refund window is chosen.

## Health

`GET /api/health` reports whether checkout and database configuration are present without exposing credentials.

## Build spec

See `docs/storefront-build-spec.md`.

## Milestone B: Money

Scaffolded on `storefront-v1`:

- hosted Stripe Checkout session creation
- server-owned Core and Lite Price IDs
- Stripe automatic tax
- promotion-code support
- request idempotency for checkout starts
- signed Stripe webhook verification
- webhook replay protection
- atomic paid-order database RPC
- refund state updates
- first-touch UTM and 60-day affiliate-ref cookies
- safe thank-you placeholder with no private delivery link

The checkout UI remains disabled until the intended Stripe account is connected.

## Next milestone

Milestone C validates the paid Checkout Session on the thank-you page, delivers the purchased asset, sends the delivery email, and logs delivery state.

## Stripe sandbox

The connected Stripe account currently exposed to this build is **Send Toolkit sandbox**.

Created in sandbox:
- Core product: `prod_VNpcSYpUr1qC9b`
- Core price ($37): `price_1UN3x4KBSg229SLEks6741xL`
- Lite product: `prod_VNpc8nRG2mjmG3`
- Lite price ($19): `price_1UN3xHKBSg229SLEdEqFDtgI`

The sandbox has Stripe Managed Payments enabled by default. The storefront intentionally disables Managed Payments per Checkout Session because the approved architecture keeps SendToolkit as the merchant and uses standard hosted Stripe Checkout.

Stripe Tax is intentionally disabled until Tax Settings have a head office and confirmed active registrations. The sandbox Tax Settings status is currently `pending` and has no registrations.

The runtime still needs a restricted Stripe API key in Vercel before storefront Checkout buttons can be enabled.
