# Stripe sandbox checkpoint

Connected account: Send Toolkit sandbox

## Created

- The Client Firefighter
  - Product: prod_VNpcSYpUr1qC9b
  - Price: price_1UN3x4KBSg229SLEks6741xL
  - Amount: $37 one time
- Client Firefighter Lite
  - Product: prod_VNpc8nRG2mjmG3
  - Price: price_1UN3xHKBSg229SLEdEqFDtgI
  - Amount: $19 one time

Both products were validated by successfully creating hosted Checkout Sessions in Stripe sandbox.

## Checkout policy

- Hosted Checkout
- Dynamic payment methods
- Promotion codes enabled
- Customer creation enabled
- Managed Payments explicitly disabled
- Automatic tax disabled until Tax Settings and registrations are verified
- Webhook-driven fulfillment
- Idempotent Checkout starts

## Still required before the website can charge

1. Restricted Stripe API key for this sandbox stored as a Vercel sensitive environment variable.
2. Stripe webhook endpoint and signing secret once the webhook route is publicly reachable.
3. Dedicated SendToolkit Supabase project for orders and fulfillment.
4. Live Stripe account/product setup after sandbox E2E tests pass.

Preview build checkpoint requested after Stripe integration changes.
