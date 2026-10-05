create or replace function public.record_paid_order(
  p_customer_email text,
  p_stripe_customer_id text,
  p_session_id text,
  p_payment_intent_id text,
  p_currency text,
  p_subtotal integer,
  p_discount integer,
  p_tax integer,
  p_total integer,
  p_sku text,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_utm_content text,
  p_utm_term text,
  p_ref_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_product_id uuid;
  v_partner_id uuid;
  v_order_id uuid;
begin
  select id into v_order_id
  from public.orders
  where stripe_checkout_session_id = p_session_id;

  if v_order_id is not null then
    return v_order_id;
  end if;

  insert into public.customers (email, stripe_customer_id)
  values (p_customer_email::citext, p_stripe_customer_id)
  on conflict (email) do update
    set stripe_customer_id = coalesce(excluded.stripe_customer_id, public.customers.stripe_customer_id),
        updated_at = now()
  returning id into v_customer_id;

  select id into v_product_id
  from public.products
  where sku = p_sku and is_active = true;

  if v_product_id is null then
    raise exception 'Unknown or inactive product SKU: %', p_sku;
  end if;

  if p_ref_code is not null and length(trim(p_ref_code)) > 0 then
    select id into v_partner_id
    from public.affiliate_partners
    where code = p_ref_code and status = 'active';
  end if;

  insert into public.orders (
    public_id,
    customer_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    currency,
    subtotal_cents,
    discount_cents,
    tax_cents,
    total_cents,
    status,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    affiliate_partner_id,
    paid_at
  )
  values (
    'STK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    v_customer_id,
    p_session_id,
    p_payment_intent_id,
    lower(coalesce(p_currency, 'usd')),
    greatest(coalesce(p_subtotal, 0), 0),
    greatest(coalesce(p_discount, 0), 0),
    greatest(coalesce(p_tax, 0), 0),
    greatest(coalesce(p_total, 0), 0),
    'paid',
    p_source,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    p_utm_content,
    p_utm_term,
    v_partner_id,
    now()
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id,
    product_id,
    quantity,
    unit_price_cents,
    discount_cents,
    total_cents
  )
  values (
    v_order_id,
    v_product_id,
    1,
    greatest(coalesce(p_subtotal, 0), 0),
    greatest(coalesce(p_discount, 0), 0),
    greatest(coalesce(p_total, 0) - coalesce(p_tax, 0), 0)
  );

  insert into public.scheduled_emails (
    customer_id,
    order_id,
    template_key,
    send_at,
    status
  )
  values
    (v_customer_id, v_order_id, 'order_delivery', now(), 'pending'),
    (v_customer_id, v_order_id, 'review_request_day_7', now() + interval '7 days', 'pending')
  on conflict (order_id, template_key) do nothing;

  return v_order_id;
end;
$$;

revoke all on function public.record_paid_order(
  text, text, text, text, text, integer, integer, integer, integer,
  text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.record_paid_order(
  text, text, text, text, text, integer, integer, integer, integer,
  text, text, text, text, text, text, text, text
) to service_role;
