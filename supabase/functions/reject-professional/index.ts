// Superadmin-only. Rejects a pending professional application; keeps
// professional and workforce status in sync.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, error: 'Superadmin session required' }, 401);
  }

  let payload: { professionalId?: number };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  if (!payload.professionalId) {
    return json({ success: false, error: 'professionalId is required' }, 400);
  }

  const { data: professional, error: fetchError } = await supabaseAdmin
    .from('professional')
    .select('id, status, workforce_uin')
    .eq('id', payload.professionalId)
    .maybeSingle();

  if (fetchError || !professional) {
    return json({ success: false, error: 'Professional not found' }, 404);
  }

  if (professional.status !== 'Pending') {
    return json({ success: false, error: `Already ${professional.status}` }, 409);
  }

  const { error: updateError } = await supabaseAdmin
    .from('professional')
    .update({ status: 'Rejected' })
    .eq('id', professional.id);

  if (updateError) {
    console.error('[reject-professional] update failed:', updateError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  if (professional.workforce_uin) {
    await supabaseAdmin
      .from('workforce')
      .update({ status: 'Rejected' })
      .eq('uin', professional.workforce_uin);
  }

  return json({ success: true }, 200);
});
