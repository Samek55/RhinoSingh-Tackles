// Superadmin-only. Suspends/reactivates an already-approved professional
// (does not touch Pending/Rejected — that's approve-professional/
// reject-professional's job).
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

type ToggleStatus = 'Active' | 'Suspended';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, error: 'Superadmin session required' }, 401);
  }

  let payload: { professionalId?: number; status?: ToggleStatus };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  if (!payload.professionalId || (payload.status !== 'Active' && payload.status !== 'Suspended')) {
    return json({ success: false, error: 'professionalId and status ("Active"|"Suspended") are required' }, 400);
  }

  const { data: professional, error: fetchError } = await supabaseAdmin
    .from('professional')
    .select('id, status')
    .eq('id', payload.professionalId)
    .maybeSingle();

  if (fetchError || !professional) {
    return json({ success: false, error: 'Professional not found' }, 404);
  }

  if (professional.status !== 'Active' && professional.status !== 'Suspended') {
    return json({ success: false, error: `Cannot toggle a ${professional.status} account` }, 409);
  }

  const { error: updateError } = await supabaseAdmin
    .from('professional')
    .update({ status: payload.status })
    .eq('id', professional.id);

  if (updateError) {
    console.error('[toggle-professional-status] update failed:', updateError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true }, 200);
});
