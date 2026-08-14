import { supabaseAdmin, cleanPhone } from './supabaseAdmin.ts';

const MAX_ATTEMPTS = 5;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Shared by the verify-otp edge function and set-pin's reset mode — both need
// the same hash-compare + single-use + attempt-lockout semantics against
// otp_codes.
export async function verifyServerOtp(
  phone: string,
  purpose: string,
  code: string
): Promise<{ success: boolean; error?: string; status: number }> {
  const cleaned = cleanPhone(phone);

  const { data: row, error: fetchError } = await supabaseAdmin
    .from('otp_codes')
    .select('id, code_hash, expires_at, attempts')
    .eq('phone', cleaned)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error('[verifyServerOtp] lookup failed:', fetchError);
    return { success: false, error: 'Internal error', status: 500 };
  }

  if (!row) {
    return { success: false, error: 'No pending code for this phone', status: 404 };
  }

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await supabaseAdmin.from('otp_codes').delete().eq('id', row.id);
    return { success: false, error: 'Code expired', status: 410 };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await supabaseAdmin.from('otp_codes').delete().eq('id', row.id);
    return { success: false, error: 'Too many attempts, request a new code', status: 429 };
  }

  const codeHash = await sha256(code);
  if (codeHash !== row.code_hash) {
    await supabaseAdmin.rpc('increment_otp_attempts', { p_id: row.id });
    return { success: false, error: 'Incorrect code', status: 400 };
  }

  // Single-use: consumed on success.
  await supabaseAdmin.from('otp_codes').delete().eq('id', row.id);

  return { success: true, status: 200 };
}
