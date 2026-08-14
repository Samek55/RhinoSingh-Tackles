// Superadmin-only. Lists professional accounts merged with their workforce
// application data, for UserManagement's Professionals tab.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const session = await verifyAdminSession(req);
  if (!session || (session.role !== 'superadmin' && session.role !== 'admin')) {
    return json({ success: false, error: 'Staff session required' }, 401);
  }

  const { data: professionals, error } = await supabaseAdmin
    .from('professional')
    .select('id, full_name, phone, status, workforce_uin, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[list-professionals] fetch failed:', error);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  const workforceUins = (professionals ?? []).map((p) => p.workforce_uin).filter((uin) => uin != null);
  let workforceByUin: Record<number, any> = {};
  if (workforceUins.length > 0) {
    const { data: workforceRows } = await supabaseAdmin
      .from('workforce')
      .select('uin, area_of_expertise, preferred_working_area, years_of_experience')
      .in('uin', workforceUins);
    workforceByUin = Object.fromEntries((workforceRows ?? []).map((w) => [w.uin, w]));
  }

  const merged = (professionals ?? []).map((p) => ({
    id: p.id,
    fullName: p.full_name,
    phone: p.phone,
    status: p.status,
    createdAt: p.created_at,
    areaOfExpertise: p.workforce_uin ? workforceByUin[p.workforce_uin]?.area_of_expertise ?? null : null,
    preferredWorkingArea: p.workforce_uin ? workforceByUin[p.workforce_uin]?.preferred_working_area ?? null : null,
  }));

  return json({ success: true, professionals: merged }, 200);
});
