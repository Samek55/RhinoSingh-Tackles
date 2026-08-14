// Professional PIN change/reset. 'change' requires an active session + the
// current PIN; 'reset' (forgot-PIN) requires a verified pin-reset OTP instead.
import bcrypt from 'npm:bcryptjs@2';
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyServerOtp } from '../_shared/otp.ts';
import { verifyProfessionalSession } from '../_shared/professionalSession.ts';

function isValidPin(pin: unknown): pin is string {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: {
    mode?: 'change' | 'reset';
    token?: string;
    currentPin?: string;
    phone?: string;
    otpCode?: string;
    newPin?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const { mode, newPin } = payload;
  if (!isValidPin(newPin)) {
    return json({ success: false, error: 'newPin must be 4 digits' }, 400);
  }

  let phone: string;

  if (mode === 'change') {
    const session = await verifyProfessionalSession(payload.token);
    if (!session) {
      return json({ success: false, error: 'Session expired, please log in again' }, 401);
    }
    phone = session.phone;

    const { data: professional } = await supabaseAdmin
      .from('professional')
      .select('id, pin_hash')
      .eq('phone', phone)
      .maybeSingle();

    if (!professional?.pin_hash || !payload.currentPin || !bcrypt.compareSync(payload.currentPin, professional.pin_hash)) {
      return json({ success: false, error: 'Current PIN is incorrect' }, 401);
    }
  } else if (mode === 'reset') {
    if (!payload.phone || !payload.otpCode) {
      return json({ success: false, error: 'phone and otpCode are required for reset' }, 400);
    }
    const otpResult = await verifyServerOtp(payload.phone, 'pin-reset', payload.otpCode);
    if (!otpResult.success) {
      return json(otpResult, otpResult.status);
    }
    phone = cleanPhone(payload.phone);
  } else {
    return json({ success: false, error: 'mode must be "change" or "reset"' }, 400);
  }

  const newHash = bcrypt.hashSync(newPin, 10);
  const { error: updateError } = await supabaseAdmin
    .from('professional')
    .update({ pin_hash: newHash, failed_attempts: 0, locked_until: null })
    .eq('phone', phone);

  if (updateError) {
    console.error('[set-pin] update failed:', updateError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true }, 200);
});
