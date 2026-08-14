// Verifies a server-verified OTP (see send-otp's ServerVerifiedPurpose set:
// pin-reset, work-completion) — hash-compares against otp_codes, single-use,
// attempt-limited. See _shared/otp.ts for the shared verification logic, also
// used by set-pin's reset mode.
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyServerOtp } from '../_shared/otp.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: { phone?: string; purpose?: string; code?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const { phone, purpose, code } = payload;
  if (!phone || !purpose || !code) {
    return json({ success: false, error: 'phone, purpose and code are required' }, 400);
  }

  const result = await verifyServerOtp(phone, purpose, code);
  return json(result, result.status);
});
