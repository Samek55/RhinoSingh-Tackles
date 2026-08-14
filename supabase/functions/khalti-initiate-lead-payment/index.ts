// Requires a logged-in professional session (not a bare phone param) so a
// caller can't spoof paying on someone else's behalf. Pure pass-through to
// Khalti's initiate endpoint — no DB writes here, that's confirm's job.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyProfessionalSession } from '../_shared/professionalSession.ts';

const KHALTI_INITIATE_URL = 'https://khalti.com/api/v2/epayment/initiate/';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let payload: { bookingId?: string; token?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  if (!payload.bookingId) {
    return json({ error: 'bookingId is required' }, 400);
  }

  const session = await verifyProfessionalSession(payload.token);
  if (!session) {
    return json({ error: 'Please log in again' }, 401);
  }

  const { data: professional } = await supabaseAdmin
    .from('professional')
    .select('full_name, status')
    .eq('phone', session.phone)
    .maybeSingle();

  if (!professional || professional.status !== 'Active') {
    return json({ error: 'Your account is not active' }, 403);
  }

  const secretKey = Deno.env.get('KHALTI_SECRET_KEY');
  const leadFeePaisa = Number(Deno.env.get('LEAD_FEE_PAISA') ?? '9900');
  if (!secretKey) {
    console.error('[khalti-initiate-lead-payment] KHALTI_SECRET_KEY not set');
    return json({ error: 'Payments are not configured yet' }, 500);
  }

  const khaltiResponse = await fetch(KHALTI_INITIATE_URL, {
    method: 'POST',
    headers: { Authorization: `Key ${secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      return_url: 'https://rocketsingh.app/payment/success',
      website_url: 'https://rocketsingh.app',
      amount: leadFeePaisa,
      // This Khalti merchant account is shared with HomeSewa (which uses the
      // same "LEAD-" prefix on its own bookingId) — the "RS-" prefix here is
      // what actually distinguishes a RocketSingh transaction from a HomeSewa
      // one in the shared merchant dashboard, not just the order name.
      purchase_order_id: `RS-LEAD-${payload.bookingId}-${Date.now()}`,
      purchase_order_name: 'RocketSingh Lead Opening Fee',
      customer_info: { name: professional.full_name, phone: session.phone },
    }),
  });

  const khaltiBody = await khaltiResponse.json().catch(() => ({}));
  if (!khaltiResponse.ok) {
    console.error('[khalti-initiate-lead-payment] Khalti error:', khaltiResponse.status, khaltiBody);
    return json({ error: khaltiBody?.detail || 'Could not start payment' }, 502);
  }

  return json({ pidx: khaltiBody.pidx, payment_url: khaltiBody.payment_url }, 200);
});
