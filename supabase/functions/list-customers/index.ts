// Superadmin-only. Returns customers merged with their block status —
// centralizing this server-side means blocked_customers (RLS-locked, no anon
// policies) never needs to be readable directly from the client.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const session = await verifyAdminSession(req);
  if (!session || session.role !== 'superadmin') {
    return json({ success: false, error: 'Superadmin session required' }, 401);
  }

  const [{ data: customers, error: customersError }, { data: blocked, error: blockedError }] = await Promise.all([
    supabaseAdmin
      .from('customers')
      .select('phone, full_name, first_seen_at, last_booking_at')
      .order('last_booking_at', { ascending: false })
      .limit(500),
    supabaseAdmin.from('blocked_customers').select('phone'),
  ]);

  if (customersError || blockedError) {
    console.error('[list-customers] fetch failed:', customersError, blockedError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  const blockedSet = new Set((blocked ?? []).map((b) => b.phone));
  const merged = (customers ?? []).map((c) => ({ ...c, blocked: blockedSet.has(c.phone) }));

  return json({ success: true, customers: merged }, 200);
});
