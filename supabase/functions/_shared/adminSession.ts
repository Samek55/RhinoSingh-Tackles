import { supabaseAdmin } from './supabaseAdmin.ts';

export type StaffRole = 'career' | 'admin' | 'superadmin';

// Checked by every staff-facing edge function that needs to know "who's
// calling and what role are they" — the admin_sessions equivalent of
// verifyProfessionalSession, replacing verifyFirebaseSession now that staff
// auth lives in Postgres instead of Firebase. Reads a custom header
// (x-admin-session-token), not Authorization — that header stays exclusively
// for Supabase's own anon-key JWT check, avoiding the verify_jwt platform
// collision the Firebase-token functions needed a per-function config
// workaround for.
export async function verifyAdminSession(req: Request): Promise<{ phone: string; role: StaffRole } | null> {
  const token = req.headers.get('x-admin-session-token') ?? undefined;
  if (!token) return null;

  const { data: session, error } = await supabaseAdmin
    .from('admin_sessions')
    .select('phone, role, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (error || !session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  return { phone: session.phone, role: session.role as StaffRole };
}
