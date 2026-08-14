// Creates a Pending professional-login row right after a Nepal-flagged career
// application is submitted (workforce insert already happened client-side).
// No PIN is generated here — approve-professional generates and SMS's the PIN
// once staff actually approve the application, so a Pending applicant can't
// attempt to log in with a PIN nobody has told them.
import { supabaseAdmin, cleanPhone } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: { fullName?: string; phone?: string; workforceUin?: number };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const { fullName, phone, workforceUin } = payload;
  if (!fullName || !phone) {
    return json({ success: false, error: 'fullName and phone are required' }, 400);
  }

  const cleaned = cleanPhone(phone);

  const { error } = await supabaseAdmin.from('professional').insert({
    full_name: fullName,
    phone: cleaned,
    status: 'Pending',
    workforce_uin: workforceUin ?? null,
  });

  if (error) {
    // A duplicate application from the same phone shouldn't fail the career
    // submission it's attached to — log it and report success either way.
    if (error.code === '23505') {
      return json({ success: true, note: 'already exists' }, 200);
    }
    console.error('[create-professional-login] insert failed:', error);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true }, 200);
});
