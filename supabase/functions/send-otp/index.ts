// Server-side OTP issuer. Used to also hold the Sparrow SMS token and send from
// here, but Sparrow rejects Supabase's outbound IP (rotates across AWS
// addresses, and Sparrow's account-level allowlist doesn't accept it) — the
// actual SMS delivery now happens client-side instead, using the { to, text }
// this function returns.
//
// Two trust models coexist here:
// - 'booking'/'helpbox': the caller (sparrowOtpService.ts) generates the code
//   and verifies it client-side, same as before this purpose-based rework —
//   this function just rate-limits and hands back the text to relay.
// - 'pin-reset'/'work-completion': the code is generated and hashed *here* and
//   checked later by verify-otp — these purposes guard real account/security
//   actions (professional PIN reset, marking a job complete) so a
//   client-side-only check isn't enough. The code is still only ever handed
//   back to the same caller that requested it, same trust boundary as
//   receiving it by SMS.
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

// Server-side backstop now that the endpoint is reachable with just the public
// anon key (same trust level as the rest of this app's Supabase access) — without
// this, "Resend Code" cooldowns are client-only and trivially bypassable by
// calling this function directly.
const MAX_SENDS_PER_PHONE_PER_HOUR = 5;
const SERVER_OTP_TTL_MINUTES = 5;

type ClientVerifiedPurpose = 'booking' | 'helpbox';
type ServerVerifiedPurpose = 'pin-reset' | 'work-completion';

const CLIENT_VERIFIED_PURPOSES: ClientVerifiedPurpose[] = ['booking', 'helpbox'];
const SERVER_VERIFIED_PURPOSES: ServerVerifiedPurpose[] = ['pin-reset', 'work-completion'];

function buildOtpMessage(purpose: ClientVerifiedPurpose | ServerVerifiedPurpose, otp: string, greetingName?: string): string {
  if (purpose === 'booking') {
    const firstName = greetingName ? String(greetingName).split(' ')[0] : 'Customer';
    return `Dear ${firstName}, Your Service Booking OTP code is ${otp}.\n\nThank You for using RocketSingh\n( https://RocketSingh.app )`;
  }
  if (purpose === 'helpbox') {
    return `Hi, Thank you for submitting help request. Your OTP code is ${otp}.\n\nThank You for using RocketSingh\n( https://RocketSingh.app )`;
  }
  if (purpose === 'pin-reset') {
    return `Dear Professional, your RocketSingh PIN reset OTP is ${otp}.\n\nIf you did not request this, please ignore.\n( https://RocketSingh.app )`;
  }
  return `Dear ${greetingName ? String(greetingName).split(' ')[0] : 'Customer'}, your RocketSingh service is being marked as completed.\n\nYour completion OTP is: ${otp}\n\nShare this code with the professional to confirm.\n( https://RocketSingh.app )`;
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let payload: { to?: string; otp?: string; purpose?: string; flow?: string; greetingName?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  // Accept the legacy `flow` key too so a mid-rollout client build (old app
  // version still in the wild) doesn't start failing OTP sends outright.
  const purpose = (payload.purpose ?? payload.flow) as string | undefined;
  const { greetingName } = payload;

  if (!payload.to || !/^\d{10,15}$/.test(payload.to)) {
    return json({ ok: false, error: 'Invalid phone number' }, 400);
  }
  const to = payload.to;

  const isClientVerified = CLIENT_VERIFIED_PURPOSES.includes(purpose as ClientVerifiedPurpose);
  const isServerVerified = SERVER_VERIFIED_PURPOSES.includes(purpose as ServerVerifiedPurpose);
  if (!isClientVerified && !isServerVerified) {
    return json({ ok: false, error: 'Invalid purpose' }, 400);
  }

  let otp: string;
  if (isClientVerified) {
    if (!payload.otp || !/^\d{4,8}$/.test(payload.otp)) {
      return json({ ok: false, error: 'Invalid OTP' }, 400);
    }
    otp = payload.otp;
  } else {
    // Server-verified purposes generate their own code — never trust a
    // client-supplied one here, or "server verified" would be meaningless.
    otp = generateOtp();
  }

  // Keyed on the same last-10-digits normalization cleanPhone() uses
  // everywhere else in this codebase — keying on the raw, un-normalized `to`
  // let the same real number get a fresh 5/hour budget just by padding it
  // with an extra leading digit (the /^\d{10,15}$/ check above allows that).
  const rateLimitKey = cleanPhone(to);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabaseAdmin
    .from('otp_send_log')
    .select('id', { count: 'exact', head: true })
    .eq('phone', rateLimitKey)
    .gte('sent_at', oneHourAgo);

  if (countError) {
    console.error('[send-otp] rate limit check failed:', countError);
    return json({ ok: false, error: 'Internal error' }, 500);
  }

  if ((count ?? 0) >= MAX_SENDS_PER_PHONE_PER_HOUR) {
    return json({ ok: false, error: 'Too many requests, try again later' }, 429);
  }

  if (isServerVerified) {
    const cleaned = cleanPhone(to);
    const codeHash = await sha256(otp);
    const expiresAt = new Date(Date.now() + SERVER_OTP_TTL_MINUTES * 60_000).toISOString();

    // Drop any previous code for this phone+purpose first, so a resend never
    // leaves a stale row around for verify-otp's "latest row" lookup to
    // conflict with.
    await supabaseAdmin.from('otp_codes').delete().eq('phone', cleaned).eq('purpose', purpose);

    const { error: otpInsertError } = await supabaseAdmin
      .from('otp_codes')
      .insert({ phone: cleaned, purpose, code_hash: codeHash, expires_at: expiresAt });
    if (otpInsertError) {
      console.error('[send-otp] failed to store server-verified code:', otpInsertError);
      return json({ ok: false, error: 'Internal error' }, 500);
    }
  }

  const { error: insertError } = await supabaseAdmin.from('otp_send_log').insert({ phone: rateLimitKey });
  if (insertError) {
    console.error('[send-otp] failed to record send log:', insertError);
  }

  // Sparrow rejects Supabase's outbound IP (rotates across AWS addresses, and
  // Sparrow's account-level allowlist doesn't accept it), so the actual SMS
  // send now happens client-side instead — this function's job is just the
  // rate limiting above (and, for server-verified purposes, generating/hashing
  // the code) plus handing back the exact text to send.
  const text = buildOtpMessage(purpose as ClientVerifiedPurpose | ServerVerifiedPurpose, otp, greetingName);

  return json({ ok: true, to, text }, 200);
});
