// Superadmin-only. Blocks/unblocks a customer phone number for UserManagement's
// Customers tab.
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
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

  let payload: { phone?: string; blocked?: boolean };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  if (!payload.phone || typeof payload.blocked !== 'boolean') {
    return json({ success: false, error: 'phone and blocked (boolean) are required' }, 400);
  }

  const cleaned = cleanPhone(payload.phone);

  if (payload.blocked) {
    const { error } = await supabaseAdmin
      .from('blocked_customers')
      .upsert({ phone: cleaned, blocked_by: session.uid }, { onConflict: 'phone' });
    if (error) {
      console.error('[toggle-customer-block] block failed:', error);
      return json({ success: false, error: 'Internal error' }, 500);
    }
  } else {
    const { error } = await supabaseAdmin.from('blocked_customers').delete().eq('phone', cleaned);
    if (error) {
      console.error('[toggle-customer-block] unblock failed:', error);
      return json({ success: false, error: 'Internal error' }, 500);
    }
  }

  return json({ success: true }, 200);
});
