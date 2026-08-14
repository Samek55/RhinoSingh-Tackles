// Generic SMS relay (not OTP-specific) — for informational texts like sending
// a newly-approved professional their PIN. Shares Sparrow credentials with
// send-otp but skips its OTP-purpose machinery entirely.
const SPARROW_SMS_URL = 'https://api.sparrowsms.com/v2/sms/';

export async function sendSms(to: string, text: string): Promise<boolean> {
  const token = Deno.env.get('SPARROW_TOKEN') ?? '';
  const from = Deno.env.get('SPARROW_FROM') ?? '';

  const body = new URLSearchParams({ token, from, to, text });

  const response = await fetch(SPARROW_SMS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const responseBody = await response.text();
  console.log('[sendSms] to:', to, 'status:', response.status, 'body:', responseBody);

  return response.ok;
}
