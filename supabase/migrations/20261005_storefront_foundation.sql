create extension if not exists citext;
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  slug text unique not null,
  price_cents integer not null check (price_cents >= 0),
  stripe_price_id text unique,
  delivery_type text not null check (delivery_type in ('notion','download','lead_magnet')),
  delivery_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  first_name text,
  last_name text,
  stripe_customer_id text unique,
  marketing_status text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email citext unique not null,
  code text unique not null,
  commission_bps integer not null default 4000 check (commission_bps between 0 and 10000),
  status text not null default 'active',
  cookie_days integer not null default 60,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  customer_id uuid not null references public.customers(id),
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  currency text not null default 'usd',
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null,
  status text not null check (status in ('pending','paid','refunded','partially_refunded','failed')),
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  affiliate_partner_id uuid references public.affiliate_partners(id),
  refunded_cents integer not null default 0,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  channel text not null check (channel in ('thank_you','email','admin_resend')),
  provider_message_id text,
  status text not null check (status in ('queued','sent','delivered','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  source text not null,
  status text not null default 'subscribed',
  tags text[] not null default '{}',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  ref_code text,
  resend_contact_id text,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create table if not exists public.scheduled_emails (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  subscriber_id uuid references public.subscribers(id),
  order_id uuid references public.orders(id),
  template_key text not null,
  send_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','cancelled')),
  attempts integer not null default 0,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique(order_id, template_key)
);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'received',
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  customer_id uuid not null references public.customers(id),
  product_id uuid not null references public.products(id),
  rating integer not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  verification_token_hash text unique not null,
  submitted_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.affiliate_partners(id),
  anonymous_id text,
  landing_path text,
  utm_source text,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.affiliate_partners(id),
  order_id uuid unique not null references public.orders(id),
  commission_cents integer not null check (commission_cents >= 0),
  status text not null default 'holding' check (status in ('holding','payable','paid','void')),
  hold_until timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists scheduled_emails_due_idx on public.scheduled_emails(status, send_at);
create index if not exists reviews_status_idx on public.reviews(status, submitted_at desc);
create index if not exists affiliate_clicks_partner_idx on public.affiliate_clicks(partner_id, created_at desc);

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_events enable row level security;
alter table public.subscribers enable row level security;
alter table public.scheduled_emails enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.reviews enable row level security;
alter table public.affiliate_partners enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_commissions enable row level security;

insert into public.products (sku, name, slug, price_cents, delivery_type)
values
  ('client-firefighter-core', 'The Client Firefighter', 'core', 3700, 'notion'),
  ('client-firefighter-lite', 'Client Firefighter Lite', 'lite', 1900, 'notion'),
  ('client-firefighter-mini', 'Client Firefighter Mini Pack', 'mini', 0, 'lead_magnet')
on conflict (sku) do update set
  name = excluded.name,
  slug = excluded.slug,
  price_cents = excluded.price_cents,
  delivery_type = excluded.delivery_type,
  updated_at = now();
