// Superadmin-only. Generates the PIN for a career self-signup (never set
// before this point — see admin-create's public path), activates the
// account, and SMS's the PIN.
import bcrypt from 'npm:bcryptjs@2';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';
import { buildSms } from '../_shared/sparrow.ts';

function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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
    .select('id, full_name, phone, status')
    .eq('id', payload.adminId)
    .maybeSingle();

  if (fetchError || !account) {
    return json({ success: false, message: 'Account not found' }, 404);
  }

  if (account.status !== 'Pending') {
    return json({ success: false, message: `Already ${account.status}` }, 409);
  }

  const pin = generatePin();
  const pinHash = bcrypt.hashSync(pin, 10);

  const { error: updateError } = await supabaseAdmin
    .from('admin')
    .update({ pin_hash: pinHash, status: 'Active', failed_attempts: 0, locked_until: null })
    .eq('id', account.id);

  if (updateError) {
    console.error('[approve-admin] update failed:', updateError);
    return json({ success: false, message: 'Internal error' }, 500);
  }

  const firstName = (account.full_name || 'Staff').split(' ')[0];
  const sms = buildSms(
    account.phone,
    `Dear ${firstName}, your RocketSingh staff account has been approved. Your login PIN is ${pin}. Keep it safe.\n\n( https://RocketSingh.app )`
  );

  return json({ success: true, ...sms }, 200);
});
