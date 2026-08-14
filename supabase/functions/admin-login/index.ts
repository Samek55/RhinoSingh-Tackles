// Phone+PIN login for staff (career/admin/superadmin) — replaces Firebase
// Auth. Issues a bearer-style token in admin_sessions, checked via
// x-admin-session-token on every subsequent staff-gated request.
import bcrypt from 'npm:bcryptjs@2';
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const SESSION_DAYS = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  let payload: { phone?: string; pin?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }

  const { phone, pin } = payload;
  if (!phone || !pin) {
    return json({ success: false, message: 'phone and pin are required' }, 400);
  }

  const cleaned = cleanPhone(phone);

  const { data: account, error: fetchError } = await supabaseAdmin
    .from('admin')
    .select('id, full_name, phone, role, status, pin_hash, locked_until')
    .eq('phone', cleaned)
    .maybeSingle();

  if (fetchError) {
    console.error('[admin-login] lookup failed:', fetchError);
    return json({ success: false, message: 'Internal error' }, 500);
  }

  // Same generic message whether the phone doesn't exist or the PIN is
  // wrong — don't let a caller enumerate registered staff phone numbers.
  const invalidCreds = { success: false, message: 'Invalid phone or PIN' };
  if (!account || !account.pin_hash) {
    return json(invalidCreds, 401);
  }

  if (account.locked_until && new Date(account.locked_until).getTime() > Date.now()) {
    return json({ success: false, message: 'Too many failed attempts. Try again later.' }, 423);
  }

  const matches = bcrypt.compareSync(pin, account.pin_hash);
  if (!matches) {
    const { data: rows } = await supabaseAdmin.rpc('record_login_attempt_failure', {
      p_table: 'admin',
      p_id: account.id,
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
    .from('admin')
    .update({ failed_attempts: 0, locked_until: null })
    .eq('id', account.id);

  // Status gate comes after a successful PIN match (so a wrong PIN against a
  // Pending/Rejected account still counts toward lockout) but before session
  // issuance — 200, not 401, so the client can show status-specific copy
  // instead of a generic login failure.
  if (account.status !== 'Active') {
    return json({ success: false, status: account.status, message: `Account status: ${account.status}` }, 200);
  }

  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('admin_sessions')
    .insert({ phone: cleaned, role: account.role, expires_at: expiresAt })
    .select('token')
    .single();

  if (sessionError || !session) {
    console.error('[admin-login] session creation failed:', sessionError);
    return json({ success: false, message: 'Internal error' }, 500);
  }

  return json(
    { success: true, status: 'Active', role: account.role, displayName: account.full_name, sessionToken: session.token },
    200
  );
});
