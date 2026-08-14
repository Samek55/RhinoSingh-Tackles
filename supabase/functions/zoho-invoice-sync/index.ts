// Background, admin-only invoice creation triggered when staff record a deal
// amount on a booking (BookingDetails_2.tsx). Zoho is a secondary accounting
// record — RocketSingh's own booking table stays source of truth, and a sync
// failure here never blocks or rolls back the booking itself.
//
// Two trigger paths:
//  - Supabase Database Webhook on `booking` UPDATE, protected by the
//    x-zoho-sync-secret header (the anon-key JWT the webhook's own
//    Authorization header carries isn't real protection — every installed
//    app copy has the anon key too).
//  - Manual retry, POST { bookingId }, superadmin-gated via verifyAdminSession.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

// Nepal's actual city list (src/constants/countryData.ts), minus the ambiguous
// "Other" entry both countries share — Zoho credentials are Nepal-business-
// specific, so an uncertain city errs toward NOT syncing rather than risking
// an India deal reaching the Nepal Zoho org.
const NEPAL_CITIES = ['Kathmandu', 'Bhaktapur', 'Lalitpur'];

function dataCenterHost(dc: string) {
  return dc === 'in' || dc === 'eu' ? dc : 'com';
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('ZOHO_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');
  const dc = dataCenterHost(Deno.env.get('ZOHO_DATA_CENTER') ?? 'com');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Zoho credentials are not configured yet');
  }

  const response = await fetch(`https://accounts.zoho.${dc}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(`Zoho token refresh failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function alertAdminsTokenFailure(message: string) {
  // Bypasses send-notification deliberately (same reasoning as HomeSewa's
  // implementation) — this is already inside a best-effort error path, and
  // adding another function hop here is one more thing that can fail.
  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const restKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
  if (!appId || !restKey) return;

  try {
    await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: { Authorization: `Key ${restKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        filters: [{ field: 'tag', key: 'role', relation: '=', value: 'admin' }],
        headings: { en: 'Zoho Sync Failing' },
        contents: { en: message },
      }),
    });
  } catch (e) {
    console.error('[zoho-invoice-sync] admin alert failed:', e);
  }
}

async function zohoFetch(path: string, accessToken: string, init?: RequestInit) {
  const dc = dataCenterHost(Deno.env.get('ZOHO_DATA_CENTER') ?? 'com');
  const orgId = Deno.env.get('ZOHO_ORG_ID');
  const response = await fetch(`https://www.zohoapis.${dc}/invoice/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'X-com-zoho-invoice-organizationid': orgId ?? '',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

async function findOrCreateContact(accessToken: string, phone: string, name: string): Promise<string> {
  const found = await zohoFetch(`/contacts?phone=${encodeURIComponent(phone)}`, accessToken);
  const existing = found.data?.contacts?.[0]?.contact_id;
  if (existing) return existing;

  const created = await zohoFetch('/contacts', accessToken, {
    method: 'POST',
    body: JSON.stringify({ contact_name: name, contact_persons: [{ phone }] }),
  });
  if (!created.ok) throw new Error(`Zoho contact creation failed: ${JSON.stringify(created.data)}`);
  return created.data.contact.contact_id;
}

async function findOrCreateItem(accessToken: string, name: string, rate: number): Promise<string> {
  const found = await zohoFetch(`/items?name=${encodeURIComponent(name)}`, accessToken);
  const existing = found.data?.items?.[0]?.item_id;
  if (existing) return existing;

  const created = await zohoFetch('/items', accessToken, {
    method: 'POST',
    body: JSON.stringify({ name, rate }),
  });
  if (!created.ok) throw new Error(`Zoho item creation failed: ${JSON.stringify(created.data)}`);
  return created.data.item.item_id;
}

async function syncBooking(booking: any): Promise<{ status: string }> {
  if (booking.zoho_invoice_id) return { status: 'already_synced' };
  if (booking.deal_amount == null) return { status: 'no_deal_amount' };

  const { data: claimed } = await supabaseAdmin.rpc('claim_zoho_sync', { p_booking_id: booking.bookingid });
  if (!claimed) return { status: 'already_syncing' };

  try {
    const accessToken = await getAccessToken();
    const contactId = await findOrCreateContact(accessToken, booking.phone, booking.full_name);

    const services: string[] = booking.select_services ?? [];
    const itemName = services.join(', ') || 'RocketSingh Service';
    const itemId = await findOrCreateItem(accessToken, services[0] || itemName, Number(booking.deal_amount));

    const invoiceResult = await zohoFetch('/invoices', accessToken, {
      method: 'POST',
      body: JSON.stringify({
        customer_id: contactId,
        date: new Date().toISOString().slice(0, 10),
        reference_number: String(booking.bookingid),
        line_items: [{ item_id: itemId, name: itemName, rate: Number(booking.deal_amount), quantity: 1 }],
        notes: [booking.budget ? `Customer budget: ${booking.budget}` : null, booking.deal_note].filter(Boolean).join('\n'),
      }),
    });

    if (!invoiceResult.ok) throw new Error(`Zoho invoice creation failed: ${JSON.stringify(invoiceResult.data)}`);

    await supabaseAdmin
      .from('booking')
      .update({
        zoho_invoice_id: invoiceResult.data.invoice.invoice_id,
        zoho_customer_id: contactId,
        zoho_sync_status: 'synced',
        zoho_sync_error: null,
        zoho_synced_at: new Date().toISOString(),
      })
      .eq('bookingid', booking.bookingid);

    return { status: 'synced' };
  } catch (error) {
    const message = String(error instanceof Error ? error.message : error).slice(0, 500);
    await supabaseAdmin
      .from('booking')
      .update({ zoho_sync_status: 'failed', zoho_sync_error: message })
      .eq('bookingid', booking.bookingid);

    if (message.includes('token refresh failed') || message.includes('not configured')) {
      await alertAdminsTokenFailure(`Zoho sync is failing: ${message}`);
    }
    return { status: 'failed' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ status: 'error', message: 'Method not allowed' }, 405);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ status: 'error', message: 'Invalid JSON' }, 400);
  }

  const isWebhook = body?.type === 'UPDATE' && body?.table === 'booking';
  let bookingId: number | undefined;

  if (isWebhook) {
    const secret = req.headers.get('x-zoho-sync-secret');
    if (!secret || secret !== Deno.env.get('ZOHO_SYNC_WEBHOOK_SECRET')) {
      return json({ status: 'error', message: 'Unauthorized' }, 401);
    }
    // Dashboard webhook UI has no column-level WHERE — filter in-function to
    // only the deal_amount null→value transition.
    if (body.old_record?.deal_amount != null || body.record?.deal_amount == null) {
      return json({ status: 'skipped', reason: 'not a deal_amount transition' }, 200);
    }
    bookingId = body.record?.bookingid;
  } else {
    const session = await verifyAdminSession(req);
    if (!session || session.role !== 'superadmin') {
      return json({ status: 'error', message: 'Superadmin session required' }, 401);
    }
    bookingId = body.bookingId;
  }

  if (!bookingId) {
    return json({ status: 'error', message: 'bookingId is required' }, 400);
  }

  const { data: booking, error } = await supabaseAdmin
    .from('booking')
    .select('bookingid, full_name, phone, city, select_services, budget, deal_amount, deal_note, zoho_invoice_id')
    .eq('bookingid', bookingId)
    .maybeSingle();

  if (error || !booking) {
    return json({ status: 'error', message: 'Booking not found' }, 404);
  }

  if (!NEPAL_CITIES.includes(booking.city)) {
    return json({ status: 'skipped', reason: 'not a Nepal booking' }, 200);
  }

  const result = await syncBooking(booking);
  // Always 200 except unauthorized/malformed — never blocks the webhook or
  // the booking flow, even when the sync itself failed.
  return json(result, 200);
});
