// Superadmin-only. Lists staff accounts from the Postgres admin table
// (replaces the old Firebase Realtime Database users/* read).
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, error: 'Superadmin session required' }, 401);
  }

  const { data: staff, error } = await supabaseAdmin
    .from('admin')
    .select('id, full_name, phone, role, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[list-staff] fetch failed:', error);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true, staff: staff ?? [] }, 200);
});
