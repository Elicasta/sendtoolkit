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

## Next milestone

Milestone B wires Stripe Checkout, signed webhooks, order persistence, refunds, and idempotency after the intended Stripe account and SendToolkit Supabase project are connected.
