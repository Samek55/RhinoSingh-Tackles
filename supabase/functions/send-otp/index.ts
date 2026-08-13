// Server-side OTP sender: holds the Sparrow SMS token (never shipped to the app)
// and gives Sparrow's IP whitelist a single, stable IP to allow instead of every
// user's phone's carrier IP.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SPARROW_SMS_URL = 'https://api.sparrowsms.com/v2/sms/';

// Server-side backstop now that the endpoint is reachable with just the public
// anon key (same trust level as the rest of this app's Supabase access) — without
// this, "Resend Code" cooldowns are client-only and trivially bypassable by
// calling this function directly.
const MAX_SENDS_PER_PHONE_PER_HOUR = 5;

type OtpFlow = 'booking' | 'helpbox';

function buildOtpMessage(flow: OtpFlow, otp: string, greetingName?: string): string {
  if (flow === 'booking') {
    const firstName = greetingName ? String(greetingName).split(' ')[0] : 'Customer';
    return `Dear ${firstName}, Your Service Booking OTP code is ${otp}.\n\nThank You for using RocketSingh\n( https://RocketSingh.app )`;
  }
  return `Hi, Thank you for submitting help request. Your OTP code is ${otp}.\n\nThank You for using RocketSingh\n( https://RocketSingh.app )`;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  let payload: { to?: string; otp?: string; flow?: OtpFlow; greetingName?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const { to, otp, flow, greetingName } = payload;

  // fullPhone is digits-only with country code, e.g. 9779843624971 (no '+').
  if (!to || !/^\d{10,15}$/.test(to)) {
    return json({ ok: false, error: 'Invalid phone number' }, 400);
  }
  if (!otp || !/^\d{4,8}$/.test(otp)) {
    return json({ ok: false, error: 'Invalid OTP' }, 400);
  }
  if (flow !== 'booking' && flow !== 'helpbox') {
    return json({ ok: false, error: 'Invalid flow' }, 400);
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabaseAdmin
    .from('otp_send_log')
    .select('id', { count: 'exact', head: true })
    .eq('phone', to)
    .gte('sent_at', oneHourAgo);

  if (countError) {
    console.error('[send-otp] rate limit check failed:', countError);
    return json({ ok: false, error: 'Internal error' }, 500);
  }

  if ((count ?? 0) >= MAX_SENDS_PER_PHONE_PER_HOUR) {
    return json({ ok: false, error: 'Too many requests, try again later' }, 429);
  }

  const token = Deno.env.get('SPARROW_TOKEN') ?? '';
  const from = Deno.env.get('SPARROW_FROM') ?? '';

  const body = new URLSearchParams({
    token,
    from,
    to,
    text: buildOtpMessage(flow, otp, greetingName),
  });

  const sparrowResponse = await fetch(SPARROW_SMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const sparrowBody = await sparrowResponse.text();
  console.log('[send-otp] to:', to, 'status:', sparrowResponse.status, 'body:', sparrowBody);

  if (!sparrowResponse.ok) {
    return json({ ok: false, error: 'SMS provider error' }, 502);
  }

  const { error: insertError } = await supabaseAdmin.from('otp_send_log').insert({ phone: to });
  if (insertError) {
    console.error('[send-otp] failed to record send log:', insertError);
  }

  return json({ ok: true }, 200);
});
