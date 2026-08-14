import { supabaseAdmin } from './supabaseAdmin.ts';

// Checked by every professional-facing edge function that needs to know
// "which professional is this" after login (set-pin's change mode, and later
// the Lead Fee functions) — the professional_sessions equivalent of
// verifyFirebaseSession for staff.
export async function verifyProfessionalSession(token: string | undefined): Promise<{ phone: string } | null> {
  if (!token) return null;

  const { data: session, error } = await supabaseAdmin
    .from('professional_sessions')
    .select('phone, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error || !session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  return { phone: session.phone };
}
