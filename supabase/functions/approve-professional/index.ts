// Superadmin-only. Generates the professional's PIN (never set before this
// point — see create-professional-login), activates both professional and
// workforce rows together, and SMS's the PIN to the applicant.
import bcrypt from 'npm:bcryptjs@2';
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';
import { sendSms } from '../_shared/sparrow.ts';

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

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
    .select('id, full_name, phone, status, workforce_uin')
    .eq('id', payload.professionalId)
    .maybeSingle();

  if (fetchError || !professional) {
    return json({ success: false, error: 'Professional not found' }, 404);
  }

  if (professional.status !== 'Pending') {
    return json({ success: false, error: `Already ${professional.status}` }, 409);
  }

  const pin = generatePin();
  const pinHash = bcrypt.hashSync(pin, 10);

  const { error: updateError } = await supabaseAdmin
    .from('professional')
    .update({ pin_hash: pinHash, status: 'Active', failed_attempts: 0, locked_until: null })
    .eq('id', professional.id);

  if (updateError) {
    console.error('[approve-professional] update failed:', updateError);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  if (professional.workforce_uin) {
    // workforce's own status vocabulary is Pending/Accepted/Rejected/Pending-Update
    // (see ProfessionalDetails.tsx) — distinct from professional.status's
    // Pending/Active/Suspended/Rejected, kept in sync but not identical strings.
    await supabaseAdmin
      .from('workforce')
      .update({ status: 'Accepted' })
      .eq('uin', professional.workforce_uin);
  }

  const firstName = professional.full_name.split(' ')[0];
  await sendSms(
    professional.phone,
    `Dear ${firstName}, your RocketSingh professional account has been approved. Your login PIN is ${pin}. Keep it safe.\n\n( https://RocketSingh.app )`
  );

  return json({ success: true }, 200);
});
