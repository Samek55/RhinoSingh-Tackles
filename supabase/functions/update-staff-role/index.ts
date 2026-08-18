// Superadmin-only. Changes an existing staff account's role in the Postgres
// admin table (replaces the old Firebase RTDB users/{uid}/role.json write).
// Does not create accounts — admin-create already does that.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

type StaffRole = 'career' | 'admin' | 'superadmin';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, error: 'Superadmin session required' }, 401);
  }

  let payload: { id?: number; role?: StaffRole };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  if (!payload.id || !['career', 'admin', 'superadmin'].includes(payload.role ?? '')) {
    return json({ success: false, error: 'id and a valid role are required' }, 400);
  }

  const { data: updated, error } = await supabaseAdmin
    .from('admin')
    .update({ role: payload.role })
    .eq('id', payload.id)
    .select('id');

  if (error) {
    console.error('[update-staff-role] update failed:', error);
    return json({ success: false, error: 'Internal error' }, 500);
  }
  if (!updated || updated.length === 0) {
    return json({ success: false, error: 'Account not found' }, 404);
  }

  return json({ success: true }, 200);
});
