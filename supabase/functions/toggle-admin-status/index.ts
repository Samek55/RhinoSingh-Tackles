// Superadmin-only. Suspends/reactivates an already-approved staff account
// (does not touch Pending/Rejected — that's approve-admin/reject-admin's
// job). Deactivation also ends any live session immediately rather than
// waiting out the 30-day expiry.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

type ToggleStatus = 'Active' | 'Inactive';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, message: 'Superadmin session required' }, 401);
  }

  let payload: { id?: number; status?: ToggleStatus };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }

  if (!payload.id || (payload.status !== 'Active' && payload.status !== 'Inactive')) {
    return json({ success: false, message: 'id and status ("Active"|"Inactive") are required' }, 400);
  }

  const { data: account, error: fetchError } = await supabaseAdmin
    .from('admin')
    .select('id, phone, status')
    .eq('id', payload.id)
    .maybeSingle();

  if (fetchError || !account) {
    return json({ success: false, message: 'Account not found' }, 404);
  }

  if (account.status !== 'Active' && account.status !== 'Inactive') {
    return json({ success: false, message: `Cannot toggle a ${account.status} account` }, 409);
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('admin')
    .update({ status: payload.status })
    .eq('id', account.id)
    .eq('status', account.status)
    .select('id');

  if (updateError) {
    console.error('[toggle-admin-status] update failed:', updateError);
    return json({ success: false, message: 'Internal error' }, 500);
  }
  if (!updated || updated.length === 0) {
    return json({ success: false, message: 'This account was already updated by someone else.' }, 409);
  }

  if (payload.status === 'Inactive') {
    await supabaseAdmin.from('admin_sessions').delete().eq('phone', account.phone);
  }

  return json({ success: true }, 200);
});
