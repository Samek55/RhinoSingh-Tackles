import { createClient } from 'jsr:@supabase/supabase-js@2';

// Service-role client shared by every edge function that needs to bypass RLS
// (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are auto-injected into every
// function's environment by Supabase, no manual secret needed).
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Phone numbers arrive in different shapes across the app (with/without
// country code, spaces, dashes). Strip everything but digits and keep just
// the last 10 (the local number, matching HomeSewa's convention) so every
// table keys on one consistent format regardless of whether a "977"/"+977"
// prefix was included by the caller.
export function cleanPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.slice(-10);
}
