function validEmail(value) {
  return typeof value === 'string' && value.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function resendFetch(path, options = {}) {
  const response = await fetch(`https://api.resend.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_SEGMENT_ID;
  if (!apiKey || !segmentId) {
    return res.status(503).json({ error: 'mailing_list_not_configured' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const company = String(req.body?.company || '').trim();

  // Honeypot. Bots often fill this field; humans never see it.
  if (company) return res.status(200).json({ ok: true });
  if (!validEmail(email)) return res.status(400).json({ error: 'invalid_email' });

  try {
    const create = await resendFetch('/contacts', {
      method: 'POST',
      body: JSON.stringify({
        email,
        unsubscribed: false,
        properties: { source: 'sendtoolkit_site' }
      })
    });

    // Existing contacts are fine. We still make sure they are in the SendToolkit segment.
    if (!create.response.ok && ![409, 422].includes(create.response.status)) {
      console.error('Resend create contact failed', { status: create.response.status, name: create.body?.name || 'unknown' });
      return res.status(502).json({ error: 'signup_unavailable' });
    }

    const add = await resendFetch(`/contacts/${encodeURIComponent(email)}/segments/${encodeURIComponent(segmentId)}`, {
      method: 'POST'
    });

    if (!add.response.ok && add.response.status !== 409) {
      console.error('Resend add segment failed', { status: add.response.status, name: add.body?.name || 'unknown' });
      return res.status(502).json({ error: 'signup_unavailable' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Resend request failed', { message: error?.message || 'unknown' });
    return res.status(502).json({ error: 'signup_unavailable' });
  }
}