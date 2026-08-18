// Staff PIN change/reset. 'change' proves identity via the current PIN
// (phone+oldPin, no session token needed); 'reset' (forgot-PIN) proves it via
// a verified pin-reset OTP instead. Named admin-set-pin (not set-pin) since
// that name is already taken by the unrelated professional/marketplace
// system's PIN function.
import bcrypt from 'npm:bcryptjs@2';
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyServerOtp } from '../_shared/otp.ts';
import { buildSms } from '../_shared/sparrow.ts';

function isValidPin(pin: unknown): pin is string {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  let payload: {
    mode?: 'change' | 'reset';
    phone?: string;
    oldPin?: string;
    otpCode?: string;
    newPin?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }

  const { mode, newPin } = payload;
  if (!isValidPin(newPin)) {
    return json({ success: false, message: 'newPin must be 4 digits' }, 400);
  }
  if (!payload.phone) {
    return json({ success: false, message: 'phone is required' }, 400);
  }

  const cleaned = cleanPhone(payload.phone);

  const { data: account } = await supabaseAdmin
    .from('admin')
    .select('id, full_name, pin_hash')
    .eq('phone', cleaned)
    .maybeSingle();

  if (!account) {
    return json({ success: false, message: 'This phone number is not registered.' }, 404);
  }

  if (mode === 'change') {
    if (!payload.oldPin || !account.pin_hash || !bcrypt.compareSync(payload.oldPin, account.pin_hash)) {
      return json({ success: false, message: 'Current PIN is incorrect' }, 401);
    }
  } else if (mode === 'reset') {
    if (!payload.otpCode) {
      return json({ success: false, message: 'otpCode is required for reset' }, 400);
    }
    const otpResult = await verifyServerOtp(cleaned, 'pin-reset', payload.otpCode);
    if (!otpResult.success) {
      return json(otpResult, otpResult.status);
    }
  } else {
    return json({ success: false, message: 'mode must be "change" or "reset"' }, 400);
  }

  const newHash = bcrypt.hashSync(newPin, 10);
  const { error: updateError } = await supabaseAdmin
    .from('admin')
    .update({ pin_hash: newHash, failed_attempts: 0, locked_until: null })
    .eq('id', account.id);

  if (updateError) {
    console.error('[admin-set-pin] update failed:', updateError);
    return json({ success: false, message: 'Internal error' }, 500);
  }

  // A PIN change/reset invalidates every other session for this account.
  await supabaseAdmin.from('admin_sessions').delete().eq('phone', cleaned);

  const firstName = (account.full_name || 'Staff').split(' ')[0];
  const sms = buildSms(cleaned, `Dear ${firstName}, your RocketSingh staff PIN was just changed. If this wasn't you, contact your admin immediately.\n\n( https://RocketSingh.app )`);

  return json({ success: true, fullName: account.full_name || 'Staff', ...sms }, 200);
});
