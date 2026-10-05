# SendToolkit Storefront Build Spec

Status: approved scope for implementation  
Branch: `storefront-v1`  
Production domain: `sendtoolkit.com`  
Primary product: The Client Firefighter

## 1. Product and business rules

### Products

| SKU | Product | Price | Access |
| --- | --- | ---: | --- |
| `client-firefighter-core` | The Client Firefighter Core | $37 | Paid Notion duplicate link or protected download |
| `client-firefighter-lite` | The Client Firefighter Lite | $19 | Paid Notion duplicate link or protected download |
| `client-firefighter-mini` | Free Mini Pack | $0 | 10-12 template lead magnet delivered by email |

Phase 2 products:
- `contract-clause-pack` at $9 as the first order bump.
- Core founder price at $27 with a real expiry date.
- Lite to Core upgrade at the exact remaining amount.

### Positioning

Do not lead with template count. Lead with:

> The response system for uncomfortable client conversations.

Supporting line:

> What to say when a client situation turns into a problem.

Core brand palette:
- Operator Black: `#101114`
- Signal Lime: `#C8F135`
- System Bone: `#F5F2EA`

Aesthetic:
- Dark
- Editorial
- Operator-coded
- Cinematic
- No lifestyle filler
- No fake urgency
- No fake reviews

## 2. Stack

- Next.js App Router
- TypeScript
- Vercel
- Stripe Checkout + Stripe Tax
- Supabase Postgres
- Supabase Auth for admin access only
- Resend for transactional and lifecycle email
- PostHog for funnel analytics
- Vercel Cron for scheduled sends
- Zod for server-side validation

No client-side secret keys.

## 3. Architecture

```text
Visitor
  |
  v
Next.js storefront
  |-------------------------|
  |                         |
  v                         v
Stripe Checkout         Lead magnet form
  |                         |
  v                         v
Stripe webhook          Supabase subscriber
  |                         |
  v                         v
Order transaction       Resend delivery
  |
  +--> Thank-you access
  +--> Delivery email
  +--> Scheduled day-7 review request
  +--> Attribution / affiliate credit
  +--> Admin reporting
```

Supabase is the system of record for customers, orders, delivery state, reviews, affiliate attribution, and email scheduling.

Stripe is the system of record for payment status, tax, refunds, and coupon redemption.

Resend is the delivery provider, not the primary database.

## 4. Environment variables

Required for Phase 1:

```bash
NEXT_PUBLIC_SITE_URL=https://sendtoolkit.com

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_CORE=
STRIPE_PRICE_LITE=
STRIPE_PRICE_BUMP=
STRIPE_FOUNDER_COUPON_ID=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=SendToolkit <hello@sendtoolkit.com>

ADMIN_EMAILS=

POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

Rules:
- Stripe, Supabase service-role, webhook, and Resend secrets are server-only.
- Never expose service-role credentials through `NEXT_PUBLIC_*`.
- Environment variables live in Vercel, not GitHub.

## 5. Database schema

All IDs should use UUIDs unless the provider ID itself is the primary external identifier.

### `products`

```sql
id uuid primary key default gen_random_uuid()
sku text unique not null
name text not null
slug text unique not null
price_cents integer not null
stripe_price_id text unique
delivery_type text not null check (delivery_type in ('notion','download','lead_magnet'))
delivery_url text
is_active boolean not null default true
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `customers`

```sql
id uuid primary key default gen_random_uuid()
email citext unique not null
first_name text
last_name text
stripe_customer_id text unique
marketing_status text not null default 'unknown'
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `orders`

```sql
id uuid primary key default gen_random_uuid()
public_id text unique not null
customer_id uuid not null references customers(id)
stripe_checkout_session_id text unique not null
stripe_payment_intent_id text
stripe_charge_id text
currency text not null default 'usd'
subtotal_cents integer not null
discount_cents integer not null default 0
tax_cents integer not null default 0
total_cents integer not null
status text not null check (status in ('pending','paid','refunded','partially_refunded','failed'))
source text
utm_source text
utm_medium text
utm_campaign text
utm_content text
utm_term text
affiliate_partner_id uuid
refunded_cents integer not null default 0
paid_at timestamptz
refunded_at timestamptz
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

### `order_items`

```sql
id uuid primary key default gen_random_uuid()
order_id uuid not null references orders(id) on delete cascade
product_id uuid not null references products(id)
quantity integer not null default 1
unit_price_cents integer not null
discount_cents integer not null default 0
total_cents integer not null
created_at timestamptz not null default now()
```

### `delivery_events`

```sql
id uuid primary key default gen_random_uuid()
order_id uuid not null references orders(id) on delete cascade
product_id uuid not null references products(id)
channel text not null check (channel in ('thank_you','email','admin_resend'))
provider_message_id text
status text not null check (status in ('queued','sent','delivered','failed'))
error_message text
created_at timestamptz not null default now()
```

### `subscribers`

```sql
id uuid primary key default gen_random_uuid()
email citext unique not null
source text not null
status text not null default 'subscribed'
tags text[] not null default '{}'
utm_source text
utm_medium text
utm_campaign text
utm_content text
utm_term text
ref_code text
resend_contact_id text
created_at timestamptz not null default now()
unsubscribed_at timestamptz
```

Lead-magnet tags:
- `lead-magnet`
- `mini-pack`
- `free-pack-sequence`

Buyer tags:
- `buyer`
- `core-buyer`
- `lite-buyer`

### `scheduled_emails`

```sql
id uuid primary key default gen_random_uuid()
customer_id uuid references customers(id)
subscriber_id uuid references subscribers(id)
order_id uuid references orders(id)
template_key text not null
send_at timestamptz not null
status text not null default 'pending' check (status in ('pending','processing','sent','failed','cancelled'))
attempts integer not null default 0
provider_message_id text
last_error text
created_at timestamptz not null default now()
sent_at timestamptz
unique(order_id, template_key)
```

Phase 1 template keys:
- `order_delivery`
- `review_request_day_7`
- `lead_magnet_delivery`

Phase 2:
- `lead_nurture_01` through `lead_nurture_05`
- `buyer_onboarding`

### `stripe_webhook_events`

```sql
stripe_event_id text primary key
event_type text not null
payload jsonb not null
status text not null default 'received'
processed_at timestamptz
error_message text
created_at timestamptz not null default now()
```

Purpose: webhook idempotency and debugging.

### `reviews`

```sql
id uuid primary key default gen_random_uuid()
order_id uuid not null references orders(id)
customer_id uuid not null references customers(id)
product_id uuid not null references products(id)
rating integer not null check (rating between 1 and 5)
body text not null
status text not null default 'pending' check (status in ('pending','approved','rejected'))
verification_token_hash text unique not null
submitted_at timestamptz not null default now()
approved_at timestamptz
```

Only paid orders can create review tokens.

### Phase 2: `affiliate_partners`

```sql
id uuid primary key default gen_random_uuid()
name text not null
email citext unique not null
code text unique not null
commission_bps integer not null default 4000
status text not null default 'active'
cookie_days integer not null default 60
created_at timestamptz not null default now()
```

### Phase 2: `affiliate_clicks`

```sql
id uuid primary key default gen_random_uuid()
partner_id uuid not null references affiliate_partners(id)
anonymous_id text
landing_path text
utm_source text
created_at timestamptz not null default now()
```

### Phase 2: `affiliate_commissions`

```sql
id uuid primary key default gen_random_uuid()
partner_id uuid not null references affiliate_partners(id)
order_id uuid unique not null references orders(id)
commission_cents integer not null
status text not null default 'holding' check (status in ('holding','payable','paid','void'))
hold_until timestamptz not null
paid_at timestamptz
created_at timestamptz not null default now()
```

## 6. Stripe implementation

### Checkout session creation

Route:

`POST /api/checkout`

Input:
```json
{
  "sku": "client-firefighter-core",
  "coupon": "optional",
  "includeBump": false
}
```

Server responsibilities:
1. Validate SKU against the database.
2. Use server-owned Stripe Price IDs.
3. Apply Stripe automatic tax.
4. Enable promotion codes where allowed.
5. Include attribution metadata.
6. Include affiliate referral metadata.
7. Create one hosted Stripe Checkout session.
8. Return only the session URL.

Never trust a price sent from the browser.

Stripe Checkout settings:
- `mode=payment`
- automatic tax enabled
- billing address collection = automatic
- customer creation = always
- promotion codes enabled
- success URL includes Checkout Session ID
- cancel URL returns to the product page
- Apple Pay / wallet support through Stripe-hosted checkout
- Stripe receipt emails enabled

### Webhook endpoint

`POST /api/webhooks/stripe`

Verify the raw-body signature with `STRIPE_WEBHOOK_SECRET`.

Handle:

#### `checkout.session.completed`
- Idempotency check.
- Upsert customer.
- Create order.
- Create order items.
- Mark order paid.
- Save UTM and affiliate attribution from metadata.
- Queue delivery email.
- Create day-7 review request.
- Create affiliate commission in Phase 2.
- Record purchase analytics event.

#### `checkout.session.async_payment_succeeded`
- Same fulfillment path if an async method is later enabled.
- Must not double-fulfill an existing order.

#### `checkout.session.async_payment_failed`
- Mark pending order failed if applicable.

#### `charge.refunded`
- Update refunded amount.
- Mark partial or full refund.
- Void unpaid affiliate commission if the refund occurs during the hold window.

#### `charge.dispute.created`
- Record dispute state for admin visibility.
- Do not automatically destroy delivery records.

Webhook rule:
- Every Stripe event ID is stored before side effects.
- Replayed events return 200 after confirming the event was already processed.

## 7. Delivery

Paid delivery can support either:
- Notion duplicate URL
- Protected file URL

### Thank-you route

`/thank-you?session_id=...`

Rules:
- The page calls a server endpoint to validate the Checkout Session.
- Access is shown only after confirmed payment.
- Never trust a `paid=true` query parameter.
- Do not put the private asset URL in static HTML.
- Page shows:
  - purchase confirmation
  - product name
  - access button
  - delivery-email status
  - support contact

### Delivery email

Subject:
`Your Client Firefighter access is ready`

Contains:
- purchased product
- access button
- short usage instruction
- support address
- refund-policy link

### Resend delivery action

Admin route:
`POST /api/admin/orders/:id/resend-delivery`

Rules:
- Admin auth required.
- Generate access server-side.
- Send through Resend.
- Log `delivery_events.channel = admin_resend`.
- Never create a second order.

## 8. Lead magnet

Page:
`/free/client-firefighter-mini`

Form fields:
- email, required
- first name, optional

On submit:
1. Validate email server-side.
2. Upsert `subscribers`.
3. Add tags `lead-magnet`, `mini-pack`, `free-pack-sequence`.
4. Sync contact to Resend.
5. Send the mini-pack immediately.
6. Record `lead_signup`.
7. Return a confirmation screen.

The free pack itself contains 10-12 useful templates and a clear Core CTA.

Duplicate signups should succeed without duplicate contacts or duplicate rows.

## 9. Email system

Use React Email or typed HTML templates in the repo.

Phase 1:
- purchase delivery
- lead-magnet delivery
- day-7 review request

Phase 2:
- 5-email lead nurture
- buyer onboarding

Vercel Cron:
`GET /api/cron/email-dispatch`

Schedule: hourly.

Dispatch algorithm:
1. Select due pending emails with row locking.
2. Mark processing.
3. Send via Resend.
4. Mark sent or failed.
5. Retry transient failures.
6. Never send the same `order_id + template_key` twice.

Unsubscribe:
- Marketing emails include unsubscribe.
- Transactional delivery emails do not depend on marketing consent.

## 10. Admin

Route group:
`/admin/*`

Auth:
- Supabase Auth magic link.
- Email must be in `ADMIN_EMAILS`.
- No public account registration.

### Dashboard

Top metrics:
- gross revenue
- net revenue after refunds
- total orders
- refund rate
- Core sales
- Lite sales
- lead signups
- checkout conversion

### Orders table

Columns:
- date
- public order ID
- customer
- product
- total
- source
- affiliate
- payment status
- delivery status

Order actions:
- open Stripe transaction
- resend delivery
- copy access link
- issue/refund through Stripe-backed action
- inspect webhook history

### Customers

- email
- purchased products
- lifetime spend
- first source
- last order
- marketing status

## 11. Legal

Pages:
- `/terms`
- `/privacy`
- `/refund-policy`
- `/disclaimer`

Required disclaimer:

> SendToolkit templates are communication tools and are not legal advice. They do not replace contracts, professional legal counsel, or advice specific to your business or jurisdiction.

Refund policy must state the actual refund window and treatment of instant-access digital goods before traffic is sent.

Do not fabricate review language or customer identities.

## 12. Phase 2 growth features

### Founder pricing

Use a server-enforced end timestamp.

Do not rely only on a countdown rendered in the browser.

When expired:
- Checkout creates the normal $37 Core session.
- Founder coupon cannot be redeemed.
- Page no longer advertises $27.

### Discount codes

Prefer Stripe Promotion Codes.

Local database may cache display metadata, but Stripe decides whether a code is valid.

Support:
- percentage
- fixed amount
- expiry date
- max redemptions

### Order bump

Before redirecting to Stripe Checkout, present one checkbox:

`Add the Contract Clause Pack for $9`

If selected, the server adds the bump Stripe Price as a second line item.

If the buyer double-taps checkout, idempotency prevents duplicate session creation where possible and the UI disables during the request.

### Lite to Core upgrade

Rules:
- Verify a paid Lite order.
- Calculate upgrade price from server-owned rules.
- Do not trust customer-supplied price.
- Create a one-time upgrade Checkout Session.
- On payment, grant Core.
- Do not revoke Lite history.

### Affiliates

Referral format:
`?ref=partner-code`

Flow:
1. Validate partner code.
2. Store first-party cookie for 60 days.
3. Track click.
4. Attach partner ID to checkout metadata.
5. On purchase, create 40% commission.
6. Commission remains `holding` until refund window closes.
7. Admin marks monthly manual payouts as paid.

Partner dashboard:
- clicks
- orders
- gross referred revenue
- commission holding
- commission payable
- commission paid

### Reviews

Day-7 review email contains a one-time verified-buyer token.

Review page:
`/review/:token`

Buyer can submit:
- rating 1-5
- text

Admin approves or rejects.

Public storefront renders only `approved` reviews.

Every public review is tied to a real paid order.

## 13. Phase 3 SEO and content

### Situation pages

Route:
`/situations/[category]/[slug]`

Examples:
- `/situations/late-payment/check-in-the-mail`
- `/situations/scope-creep/quick-extra-request`
- `/situations/ghosting/follow-up-after-quote`

Each page:
- problem-specific H1
- short explanation
- 1-2 usable templates
- Core CTA
- email capture
- FAQ schema when relevant
- Product schema where relevant
- canonical URL
- Open Graph metadata

Generate XML sitemap automatically.

### Interactive Emergency Finder

Route:
`/emergency-finder`

Flow:
1. Visitor chooses situation.
2. Show the three-response escalation path.
3. Show the first response in full.
4. Remaining responses unlock through:
   - Core purchase, or
   - email signup where intentionally allowed.

The Finder must be usable in under 10 seconds on mobile.

## 14. Analytics

Use PostHog.

Capture:
- `page_view`
- `product_view`
- `lead_signup`
- `checkout_started`
- `checkout_redirected`
- `purchase`
- `delivery_viewed`
- `review_submitted`
- `affiliate_click`

Common properties:
- path
- product_sku
- order_id when available
- utm_source
- utm_medium
- utm_campaign
- utm_content
- ref_code

Store the first-touch attribution in a first-party cookie and persist it on the order.

## 15. Page list

### Phase 1
- `/`
- `/products/core`
- `/products/lite`
- `/free/client-firefighter-mini`
- `/thank-you`
- `/privacy`
- `/terms`
- `/refund-policy`
- `/disclaimer`
- `/admin`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/customers`

### Phase 2
- `/review/[token]`
- `/affiliate/[code]` optional friendly redirect
- `/partners`
- `/partners/dashboard`

### Phase 3
- `/emergency-finder`
- `/situations/[category]/[slug]`

## 16. API route list

### Public
- `POST /api/checkout`
- `POST /api/leads`
- `POST /api/reviews/[token]`
- `POST /api/unsubscribe`

### Provider
- `POST /api/webhooks/stripe`

### Scheduled
- `GET /api/cron/email-dispatch`

### Admin
- `POST /api/admin/orders/[id]/resend-delivery`
- `POST /api/admin/orders/[id]/refund`
- `POST /api/admin/reviews/[id]/approve`
- `POST /api/admin/reviews/[id]/reject`

## 17. Acceptance criteria

### Product page
- Correct product and price render from server-owned configuration.
- Product page identifies who it is for and not for.
- Refund policy is visible before purchase.
- Only approved verified-buyer reviews render.
- Mobile CTA remains usable without covering content.

### Checkout
- Buyer can pay by card.
- Apple Pay appears when Stripe/browser/device eligibility allows it.
- Tax is calculated by Stripe.
- Promotion codes work where enabled.
- Double-clicking the CTA does not create two orders.
- Browser never receives Stripe secret credentials.
- Price cannot be manipulated from DevTools.

### Payment fulfillment
- Signed valid Stripe webhook creates exactly one order.
- Replaying the same webhook creates no duplicate order, email, or commission.
- Payment confirmation triggers delivery.
- Buyer sees access within one minute.
- Buyer receives delivery email within one minute under normal provider conditions.

### Lead magnet
- Valid email receives the mini-pack.
- Subscriber is tagged.
- Duplicate signup does not create duplicate rows.
- Invalid email is rejected.
- Marketing consent language is visible.

### Email
- Delivery email sends once per paid order.
- Day-7 review request is scheduled once.
- Failed sends are visible in admin.
- Marketing mail has unsubscribe support.
- Transactional order delivery still works for unsubscribed customers.

### Admin
- Non-admin cannot access any admin route.
- Admin sees orders, customers, revenue, refunds, and delivery state.
- Resend Delivery sends one new delivery email without creating a new order.
- Refund action updates Stripe first, then local state from webhook truth.

### Reviews
- Only a verified paid buyer token can submit.
- Review is hidden until approved.
- Rejected review never renders publicly.
- Storefront never seeds fake review content.

### Attribution
- UTM/ref attribution survives checkout redirect.
- Purchase stores source data.
- Admin can see order source.
- Affiliate credit uses the valid 60-day referral cookie in Phase 2.

## 18. Test plan

### Unit
- checkout payload validation
- price lookup
- attribution parser
- affiliate commission calculation
- scheduled-email dedupe
- review token validation

### Integration
- Stripe Checkout Session creation
- signed webhook handling
- replayed webhook idempotency
- Resend send wrapper
- Supabase order transaction
- refund handling

### E2E
1. Core buyer from homepage -> Stripe test checkout -> thank-you -> delivery email -> order visible in admin.
2. Lite buyer flow.
3. Coupon checkout.
4. Free-pack signup and delivery.
5. Duplicate lead signup.
6. Double-click checkout.
7. Webhook replay.
8. Full refund.
9. Day-7 review scheduling.
10. Admin resend delivery.
11. Unauthorized admin access.
12. Mobile funnel from landing page to Checkout redirect.

## 19. Build order

### Milestone A: Foundation
- Convert static site to Next.js App Router.
- Preserve current brand styling.
- Add typed product config.
- Add Supabase schema and migrations.
- Add environment validation.

### Milestone B: Money
- Stripe Checkout.
- Webhook idempotency.
- Orders/customers/order items.
- Refund state.

### Milestone C: Delivery
- Thank-you page.
- Resend transactional email.
- Delivery event log.
- Admin resend.

### Milestone D: Leads
- Free mini-pack page.
- Subscriber storage/tagging.
- Instant delivery.

### Milestone E: Admin
- Admin auth.
- Metrics.
- Orders/customers/refunds/delivery controls.

### Milestone F: Lifecycle
- Scheduled email queue.
- Day-7 review request.
- Verified review submission and moderation.

Phase 1 is done only after Milestones A-F pass the E2E test.

## 20. Definition of done

A real buyer can:
1. land on SendToolkit,
2. buy Core for $37 through Stripe Checkout,
3. receive access on the thank-you page within one minute,
4. receive the delivery email within one minute,
5. receive the review request on day 7,
6. submit a verified review,
7. and appear in admin with correct source attribution.

A free lead can:
1. submit an email,
2. receive the mini-pack immediately,
3. be tagged for the nurture sequence,
4. and unsubscribe cleanly.

The owner can:
1. see orders,
2. see customers,
3. see revenue and refunds,
4. resend delivery,
5. trace Stripe webhook processing,
6. and identify which channel produced the order.
