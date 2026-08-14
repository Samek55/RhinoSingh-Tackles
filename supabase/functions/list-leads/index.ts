// Session-gated. Returns open bookings matching the logged-in professional's
// service/area, with contact info masked server-side unless already unlocked
// — real protection (not just a client-side UI conditional), since this is a
// query path built fresh for the marketplace rather than reusing the
// already-wide-open `booking` table read every staff screen relies on.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyProfessionalSession } from '../_shared/professionalSession.ts';

const CLOSED_STATUSES = ['Completed', 'Cancelled'];

function maskName(fullName: string | null): string {
  if (!fullName) return 'Customer';
  const [first] = fullName.trim().split(' ');
  return `${first} ***`;
}

function maskPhone(phone: string | null): string {
  if (!phone || phone.length < 4) return '••••••••';
  return `••••••${phone.slice(-2)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let payload: { token?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const session = await verifyProfessionalSession(payload.token);
  if (!session) {
    return json({ success: false, error: 'Please log in again' }, 401);
  }

  const { data: professional } = await supabaseAdmin
    .from('professional')
    .select('workforce_uin, status')
    .eq('phone', session.phone)
    .maybeSingle();

  if (!professional || professional.status !== 'Active') {
    return json({ success: false, error: 'Your account is not active' }, 403);
  }

  let services: string[] = [];
  let areas: string[] = [];
  if (professional.workforce_uin) {
    const { data: workforce } = await supabaseAdmin
      .from('workforce')
      .select('area_of_expertise, preferred_working_area')
      .eq('uin', professional.workforce_uin)
      .maybeSingle();
    services = workforce?.area_of_expertise ?? [];
    areas = workforce?.preferred_working_area ?? [];
  }

  let query = supabaseAdmin
    .from('booking')
    .select('bookingid, full_name, phone, select_services, area, city, budget, status, service_booking_datetime')
    .not('status', 'in', `(${CLOSED_STATUSES.map((s) => `"${s}"`).join(',')})`)
    .order('service_booking_datetime', { ascending: false })
    .limit(100);

  if (services.length > 0) query = query.overlaps('select_services', services);
  if (areas.length > 0) query = query.overlaps('area', areas);

  const { data: bookings, error } = await query;
  if (error) {
    console.error('[list-leads] fetch failed:', error);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  const bookingIds = (bookings ?? []).map((b) => b.bookingid);
  const { data: unlocks } = bookingIds.length
    ? await supabaseAdmin
        .from('lead_unlocks')
        .select('booking_id')
        .eq('professional_phone', session.phone)
        .in('booking_id', bookingIds)
    : { data: [] as { booking_id: number }[] };

  const unlockedIds = new Set((unlocks ?? []).map((u) => u.booking_id));

  const leads = (bookings ?? []).map((b) => {
    const unlocked = unlockedIds.has(b.bookingid);
    return {
      bookingId: b.bookingid,
      service: (b.select_services ?? []).join(', '),
      area: (b.area ?? []).join(', '),
      city: b.city,
      budget: b.budget,
      status: b.status,
      bookingDate: b.service_booking_datetime,
      unlocked,
      fullName: unlocked ? b.full_name : maskName(b.full_name),
      phone: unlocked ? b.phone : maskPhone(b.phone),
    };
  });

  return json({ success: true, leads }, 200);
});
