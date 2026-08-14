// Verifies a Khalti payment actually completed for the correct amount, then
// records the unlock. Idempotent: polling this repeatedly (LeadPayment.tsx's
// poll loop) or a retry after a recording failure never double-charges or
// double-inserts.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyProfessionalSession } from '../_shared/professionalSession.ts';

const KHALTI_LOOKUP_URL = 'https://khalti.com/api/v2/epayment/lookup/';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: { bookingId?: number; token?: string; pidx?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  if (!payload.bookingId || !payload.pidx) {
    return json({ success: false, error: 'bookingId and pidx are required' }, 400);
  }

  const session = await verifyProfessionalSession(payload.token);
  if (!session) {
    return json({ success: false, error: 'Please log in again' }, 401);
  }

  // Idempotency check first — a poll loop calling this repeatedly, or a retry
  // after a recording failure, should never re-verify with Khalti unnecessarily.
  const { data: existing } = await supabaseAdmin
    .from('lead_unlocks')
    .select('id')
    .eq('booking_id', payload.bookingId)
    .eq('professional_phone', session.phone)
    .maybeSingle();

  if (existing) {
    return json({ success: true, status: 'already_unlocked' }, 200);
  }

  const secretKey = Deno.env.get('KHALTI_SECRET_KEY');
  const leadFeePaisa = Number(Deno.env.get('LEAD_FEE_PAISA') ?? '9900');
  if (!secretKey) {
    console.error('[khalti-confirm-lead-unlock] KHALTI_SECRET_KEY not set');
    return json({ success: false, error: 'Payments are not configured yet' }, 500);
  }

  const lookupResponse = await fetch(KHALTI_LOOKUP_URL, {
    method: 'POST',
    headers: { Authorization: `Key ${secretKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pidx: payload.pidx }),
  });

  const lookup = await lookupResponse.json().catch(() => ({}));
  if (!lookupResponse.ok) {
    console.error('[khalti-confirm-lead-unlock] Khalti lookup error:', lookupResponse.status, lookup);
    return json({ success: false, error: 'Could not verify payment' }, 502);
  }

  if (lookup.status === 'Expired' || lookup.status === 'User canceled') {
    return json({ success: false, status: lookup.status }, 200);
  }

  if (lookup.status !== 'Completed' || lookup.total_amount !== leadFeePaisa) {
    return json({ success: false, status: lookup.status ?? 'unknown' }, 200);
  }

  const { error: insertError } = await supabaseAdmin.from('lead_unlocks').insert({
    booking_id: payload.bookingId,
    professional_phone: session.phone,
    pidx: payload.pidx,
    amount: lookup.total_amount,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      // Which unique constraint fired distinguishes a race (fine, already
      // unlocked) from a genuinely reused payment (a real error — this pidx
      // was already spent unlocking a different booking/phone).
      if (insertError.message?.includes('lead_unlocks_booking_professional_unique')) {
        return json({ success: true, status: 'already_unlocked' }, 200);
      }
      return json({ success: false, error: 'This payment has already been used' }, 409);
    }
    console.error('[khalti-confirm-lead-unlock] insert failed:', insertError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true, status: 'Completed' }, 200);
});
