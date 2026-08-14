// Dual-path account creation for staff.
//  - x-admin-session-token present: superadmin-only, creates any role,
//    Active immediately (AdminCreate.tsx / SuperAdminCreate.tsx).
//  - No token at all: public self-signup, always role='career',
//    status='Pending', no PIN (ProfessionalCreate.tsx) — requires an
//    existing workforce application first, same rule that screen already
//    enforces. Never trusts client-sent role/pin/status on this path.
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

type StaffRole = 'career' | 'admin' | 'superadmin';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405);
  }

  let payload: { phone?: string; fullName?: string; pin?: string; role?: StaffRole };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, message: 'Invalid JSON' }, 400);
  }

  if (!payload.phone || !payload.fullName) {
    return json({ success: false, message: 'phone and fullName are required' }, 400);
  }
  const cleaned = cleanPhone(payload.phone);

  const hasTokenHeader = req.headers.has('x-admin-session-token');
  let insertRow: { full_name: string; phone: string; role: StaffRole; status: string; pin_hash: string | null };

  if (hasTokenHeader) {
    const session = await verifyAdminSession(req);
    if (!session || session.role !== 'superadmin') {
      return json({ success: false, message: 'Superadmin session required' }, 401);
    }

    if (!payload.pin || !/^\d{6}$/.test(payload.pin) || !payload.role) {
      return json({ success: false, message: 'pin (6 digits) and role are required' }, 400);
    }

    const bcrypt = (await import('npm:bcryptjs@2')).default;
    insertRow = {
      full_name: payload.fullName,
      phone: cleaned,
      role: payload.role,
      status: 'Active',
      pin_hash: bcrypt.hashSync(payload.pin, 10),
    };
  } else {
    const { data: workforceRow, error: workforceError } = await supabaseAdmin
      .from('workforce')
      .select('phone')
      .eq('phone', cleaned)
      .maybeSingle();

    if (workforceError) {
      console.error('[admin-create] workforce lookup failed:', workforceError);
      return json({ success: false, message: 'Internal error' }, 500);
    }
    if (!workforceRow) {
      return json({ success: false, message: 'Please fill up the career form first.' }, 403);
    }

    insertRow = {
      full_name: payload.fullName,
      phone: cleaned,
      role: 'career',
      status: 'Pending',
      pin_hash: null,
    };
  }

  const { error: insertError } = await supabaseAdmin.from('admin').insert(insertRow);

  if (insertError) {
    if (insertError.code === '23505') {
      return json({ success: false, message: 'This phone number is already registered.' }, 409);
    }
    console.error('[admin-create] insert failed:', insertError);
    return json({ success: false, message: 'Internal error' }, 500);
  }

  return json({ success: true, status: insertRow.status }, 200);
});
