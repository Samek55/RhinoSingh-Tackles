// Phone+PIN login for professionals — entirely separate from RocketSingh's
// Firebase staff auth. Issues a bearer token in professional_sessions, since
// professionals have no Firebase account to hold a session for them.
import bcrypt from 'npm:bcryptjs@2';
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const SESSION_TTL_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: { phone?: string; pin?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const { phone, pin } = payload;
  if (!phone || !pin) {
    return json({ success: false, error: 'phone and pin are required' }, 400);
  }

  const cleaned = cleanPhone(phone);

  const { data: professional, error: fetchError } = await supabaseAdmin
    .from('professional')
    .select('id, full_name, phone, pin_hash, status, locked_until')
    .eq('phone', cleaned)
    .maybeSingle();

  if (fetchError) {
    console.error('[professional-login] lookup failed:', fetchError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  // Same generic message whether the phone doesn't exist or the PIN is wrong —
  // don't let a caller enumerate registered professional phone numbers.
  const invalidCreds = { success: false, error: 'Invalid phone number or PIN' };
  if (!professional || !professional.pin_hash) {
    return json(invalidCreds, 401);
  }

  if (professional.status !== 'Active') {
    return json({ success: false, error: 'This account is not active' }, 403);
  }

  if (professional.locked_until && new Date(professional.locked_until).getTime() > Date.now()) {
    return json({ success: false, error: 'Too many failed attempts. Try again later.' }, 423);
  }

  const matches = bcrypt.compareSync(pin, professional.pin_hash);
  if (!matches) {
    const { data: rows } = await supabaseAdmin.rpc('record_login_attempt_failure', {
      p_table: 'professional',
      p_id: professional.id,
      p_max_attempts: MAX_ATTEMPTS,
      p_lockout_minutes: LOCKOUT_MINUTES,
    });
    const failedAttempts = rows?.[0]?.failed_attempts ?? 0;
    return json(
      { ...invalidCreds, remainingAttempts: Math.max(0, MAX_ATTEMPTS - failedAttempts) },
      401
    );
  }

  await supabaseAdmin
    .from('professional')
    .update({ failed_attempts: 0, locked_until: null })
    .eq('id', professional.id);

  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('professional_sessions')
    .insert({ phone: cleaned, expires_at: expiresAt })
    .select('token')
    .single();

  if (sessionError || !session) {
    console.error('[professional-login] session creation failed:', sessionError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true, token: session.token, fullName: professional.full_name }, 200);
});
