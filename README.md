# SendToolkit sales site

Sales funnel for **The Client Firefighter**.

## Current checkout

The site calls `/api/checkout`. Until Stripe is connected, the endpoint returns the Stan Store product URL.

Environment variables already expected by the code:

- `CHECKOUT_MODE=stan` now. Change to `stripe` when ready.
- `STAN_STORE_URL=https://stan.store/sendtoolkit/p/the-client-firefighter`
- `PUBLIC_SITE_URL=https://sendtoolkit.com`
- `STRIPE_SECRET_KEY` when the new Stripe account is connected.
- `STRIPE_PRICE_ID` for the $37 one-time Client Firefighter price.

When `CHECKOUT_MODE=stripe` and both Stripe variables exist, all site buy buttons automatically create a hosted Stripe Checkout Session.

## Product update list

`/api/subscribe` stores opt-in contacts in Resend and adds them to the SendToolkit Product Updates segment.

Expected variables:

- `RESEND_API_KEY` with contact-management access.
- `RESEND_SEGMENT_ID=84c3d3c7-0699-487c-b8c0-af7518444385`

The segment itself already exists in Resend.

## Before switching checkout to Stripe

1. Connect the intended Stripe account.
2. Create a one-time $37 Price.
3. Add `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` in Vercel.
4. Add fulfillment for the digital product before changing `CHECKOUT_MODE` to `stripe`.
5. Test checkout in Stripe test mode, then swap to live credentials.

## Assets

Brand/product assets in `/assets` are the existing SendToolkit visuals supplied for the product.

## Deployment

Vercel Git integration deploys `main` to production and feature branches to previews. Runtime credentials stay in Vercel environment variables, never in this repository.
