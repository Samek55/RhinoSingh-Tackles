// Generic SMS relay (not OTP-specific) — for informational texts like sending
// a newly-approved professional their PIN.
//
// Used to hold the Sparrow token and call Sparrow from here. Sparrow rejects
// Supabase's outbound IP though (it rotates across AWS addresses and Sparrow's
// account-level allowlist doesn't accept it — see send-otp/index.ts for the
// same issue), so delivery now happens client-side instead. This just hands
// back the { to, text } for the caller to include in its own response.
export function buildSms(to: string, text: string): { to: string; text: string } {
  return { to, text };
}
