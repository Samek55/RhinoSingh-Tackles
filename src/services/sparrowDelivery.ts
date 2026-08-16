// Sparrow rejects Supabase's outbound IP (see supabase/functions/send-otp/index.ts),
// so SMS delivery happens here instead — from the phone's own network, which
// Sparrow doesn't block. Edge functions still do all the rate limiting and, for
// server-verified OTP purposes, code generation/hashing — this only delivers the
// exact { to, text } they hand back.
const SPARROW_SMS_URL = 'https://api.sparrowsms.com/v2/sms/';
const SPARROW_TOKEN = process.env.EXPO_PUBLIC_SPARROW_TOKEN!;
const SPARROW_FROM = process.env.EXPO_PUBLIC_SPARROW_FROM!;

export async function deliverSms(to: string, text: string): Promise<boolean> {
  const body = new URLSearchParams({ token: SPARROW_TOKEN, from: SPARROW_FROM, to, text });

  try {
    const response = await fetch(SPARROW_SMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return response.ok;
  } catch {
    return false;
  }
}
