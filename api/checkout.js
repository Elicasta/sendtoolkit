const FALLBACK_STORE = 'https://stan.store/sendtoolkit/p/the-client-firefighter';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const fallbackUrl = process.env.STAN_STORE_URL || FALLBACK_STORE;
  const checkoutMode = (process.env.CHECKOUT_MODE || 'stan').toLowerCase();
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const stripePrice = process.env.STRIPE_PRICE_ID;

  if (checkoutMode !== 'stripe' || !stripeSecret || !stripePrice) {
    return res.status(200).json({ provider: 'stan', url: fallbackUrl });
  }

  const publicSiteUrl = (process.env.PUBLIC_SITE_URL || 'https://sendtoolkit.com').replace(/\/$/, '');
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('line_items[0][price]', stripePrice);
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', `${publicSiteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${publicSiteUrl}/#pricing`);
  params.set('allow_promotion_codes', 'true');
  params.set('customer_creation', 'always');
  params.set('metadata[product]', 'client-firefighter-v1');
  params.set('metadata[source]', 'sendtoolkit-site');

  try {
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const session = await stripeResponse.json();
    if (!stripeResponse.ok || !session.url) {
      console.error('Stripe checkout session failed', { status: stripeResponse.status, code: session?.error?.code || 'unknown' });
      return res.status(502).json({ error: 'checkout_unavailable', url: fallbackUrl });
    }

    return res.status(200).json({ provider: 'stripe', url: session.url });
  } catch (error) {
    console.error('Stripe request failed', { message: error?.message || 'unknown' });
    return res.status(502).json({ error: 'checkout_unavailable', url: fallbackUrl });
  }
}