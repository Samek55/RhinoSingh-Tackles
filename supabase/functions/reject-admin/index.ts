// Superadmin-only. Rejects a pending career self-signup.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, message: 'Superadmin session required' }, 401);
  }

  let payload: { adminId?: number };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }

  if (!payload.adminId) {
    return json({ success: false, message: 'adminId is required' }, 400);
  }

  const { data: account, error: fetchError } = await supabaseAdmin
    .from('admin')
    .select('id, status')
    .eq('id', payload.adminId)
    .maybeSingle();

  if (fetchError || !account) {
    return json({ success: false, message: 'Account not found' }, 404);
  }

  if (account.status !== 'Pending') {
    return json({ success: false, message: `Already ${account.status}` }, 409);
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('admin')
    .update({ status: 'Rejected' })
    .eq('id', account.id)
    .eq('status', 'Pending')
    .select('id');

  if (updateError) {
    console.error('[reject-admin] update failed:', updateError);
    return json({ success: false, message: 'Internal error' }, 500);
  }
  if (!updated || updated.length === 0) {
    return json({ success: false, message: 'This account was already updated by someone else.' }, 409);
  }

  return json({ success: true }, 200);
});
