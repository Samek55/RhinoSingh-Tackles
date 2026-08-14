import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase';

// OneSignal tag keys only reliably support exact-match filtering, not "value is one of
// these" — so each service/area a professional covers is stored as its own boolean tag
// (e.g. "service_Plumbing" = "true") rather than a single comma-joined tag. This turns
// non-alphanumeric characters (spaces, "&", etc. in service/area names) into underscores
// so the resulting key is safe to use as a OneSignal tag key.
export const sanitizeTagKey = (value: string): string =>
  value.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');

interface SendLog {
  title?: string;
  body?: string;
  screen?: string;
  linkId?: string;
  audience?: string;
  audienceService?: string;
  audienceCity?: string;
  audiencePhone?: string;
}

// Routes every push through the send-notification edge function, which holds
// the OneSignal REST key server-side — this used to call OneSignal directly
// with EXPO_PUBLIC_ONESIGNAL_REST_API_KEY embedded in the app bundle, the same
// class of exposure the Sparrow SMS token had before it was moved server-side.
const sendNotification = async (payload: object, options?: { requireSession?: boolean; log?: SendLog }) => {
  // requireSession calls need the caller's staff session attached — the
  // SDK's default Authorization (the public anon key) doesn't carry it,
  // send-notification's own session check reads the custom header instead.
  const headers = options?.requireSession
    ? { 'x-admin-session-token': (await AsyncStorage.getItem('adminSessionToken')) ?? '' }
    : undefined;

  const { data, error } = await supabase.functions.invoke('send-notification', {
    headers,
    body: { payload, requireSession: options?.requireSession, log: options?.log },
  });
  if (error || !data?.success) {
    throw new Error(data?.error || error?.message || 'Notification failed');
  }
};

export async function notifyAdminHelpbox(notiPhone: string) {
  try {
    const CleanPhone = notiPhone.trim();

    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'admin' },
        { operator: 'OR' },
        { field: 'tag', key: 'role', relation: '=', value: 'superadmin' },
      ],
      headings: { en: '🚀 New Enquiry Available!' },
      contents: { en: `New phone no : "${CleanPhone}" has sent you an enquiry. Open RocketSingh to respond.` },
    });

    console.log(`Helpbox notification successfully targeted for "${CleanPhone}"`);
  } catch (error: any) {
    console.error('Helpbox notification error:', error.message);
  }
}

// Service booking for notifying careers → service providers who serve that specific area and service.
// Relies on each professional carrying a `service_<name>`/`area_<name>` boolean tag for
// every service/area on their profile — set at login in AdminLogin.tsx from their
// Realtime DB record. Falls back to notifying every professional (old behavior) only if
// the booking itself is missing a service or area to filter on.
export async function notifyProfessionals(service: string, bookingArea: string) {
  try {
    const cleanService = service.trim();
    const cleanArea = bookingArea.trim();

    const filters: any[] = [
      { field: 'tag', key: 'role', relation: '=', value: 'career' },
    ];
    if (cleanService) {
      filters.push({ operator: 'AND' }, { field: 'tag', key: `service_${sanitizeTagKey(cleanService)}`, relation: '=', value: 'true' });
    }
    if (cleanArea) {
      filters.push({ operator: 'AND' }, { field: 'tag', key: `area_${sanitizeTagKey(cleanArea)}`, relation: '=', value: 'true' });
    }

    await sendNotification({
      filters,
      headings: { en: '🚀 New Job Available!' },
      contents: { en: `New "${cleanService}" booking in ${cleanArea}. Open RocketSingh to respond.` },
    });

    console.log(`Booking notification successfully targeted for "${cleanService}" in ${cleanArea}`);
  } catch (error: any) {
    console.error('Booking notification error:', error.message);
  }
}

/**
 * Notifies the customer that their booking has been accepted.
 * @param service Name of the service
 * @param bookingArea Area of the booking
 * @param customerPhone The direct 10-digit phone number string (e.g., "9803179846")
 */
export async function notifyUsers(service: string, bookingArea: string, customerPhone: string) {
  try {
    const providerPhone = (await AsyncStorage.getItem('adminPhone')) || 'A service provider';
    const cleanCustomerPhone = customerPhone?.trim();

    if (!cleanCustomerPhone) {
      console.log('Notification skipped: No customer phone target provided.');
      return;
    }

    const cleanService = service?.trim() || '';
    const cleanArea = bookingArea?.trim() || '';

    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'user' },
        { operator: 'AND' },
        { field: 'tag', key: 'phone', relation: '=', value: cleanCustomerPhone },
      ],
      is_wp_wns: false,
      headings: { en: 'Booking Accepted 🚀' },
      contents: { en: `Provider (${providerPhone}) has accepted your request for "${cleanService}" in ${cleanArea}.` },
    });

    console.log(`Notification safely sent to customer tag phone: ${cleanCustomerPhone}`);
  } catch (error: any) {
    console.log('Booking notification error:', error.message);
  }
}

// Partnership form submitted → admin only
export async function notifyAdmins(applicantName: string) {
  try {
    await sendNotification({
      filters: [
        { field: 'tag', key: 'role', relation: '=', value: 'admin' },
      ],
      headings: { en: 'New Partnership Application' },
      contents: { en: `${applicantName} submitted a partnership application. Review it now.` },
    });
    console.log('Admin notification sent for partnership:', applicantName);
  } catch (error: any) {
    console.log('Admin notification error:', error.message);
  }
}

// Announcements & public messages → everyone. Unrestricted reach, so it goes
// through the same superadmin gate as notifyPublic/notifyAdminsBroadcast below.
export async function notifyAll(title: string, message: string) {
  try {
    await sendNotification(
      {
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
      },
      { requireSession: true }
    );
    console.log('Broadcast notification sent:', title);
  } catch (error: any) {
    console.log('Broadcast notification error:', error.message);
  }
}

// --- New notification types (HomeSewa parity) ---

// Fires when a professional/staff member marks a booking's work as complete
// (WorkCompletionOTP flow) — tells the customer to come rate the professional.
export async function notifyJobCompleted(customerPhone: string, bookingId: string) {
  try {
    const cleanPhone = customerPhone?.trim();
    if (!cleanPhone) return;

    await sendNotification(
      {
        filters: [
          { field: 'tag', key: 'role', relation: '=', value: 'user' },
          { operator: 'AND' },
          { field: 'tag', key: 'phone', relation: '=', value: cleanPhone },
        ],
        headings: { en: 'Job Completed ✅' },
        contents: { en: 'Your service has been marked as completed. Tap to rate your professional.' },
        data: { screen: 'RateProfessional', bookingId },
      },
      { log: { title: 'Job Completed', audience: 'customer', audiencePhone: cleanPhone } }
    );
  } catch (error: any) {
    console.log('notifyJobCompleted error:', error.message);
  }
}

// Shared by every "find professionals matching a service + area" notification
// below — RocketSingh's workforce table stores area_of_expertise/
// preferred_working_area as real Postgres arrays (confirmed against live
// data), and 'Accepted' is the workforce table's own status vocabulary
// (Pending/Accepted/Rejected/Pending-Update — distinct from the professional
// table's Pending/Active/Suspended/Rejected).
async function fetchActiveProfessionalPhones(services: string[], areas: string[]): Promise<string[]> {
  let query = supabase.from('workforce').select('phone').eq('status', 'Accepted');
  if (services.length > 0) query = query.overlaps('area_of_expertise', services);
  if (areas.length > 0) query = query.overlaps('preferred_working_area', areas);

  const { data, error } = await query;
  if (error) {
    console.log('fetchActiveProfessionalPhones error:', error.message);
    return [];
  }
  return Array.from(new Set((data ?? []).map((row: any) => row.phone).filter(Boolean)));
}

// Manual staff broadcast to every active professional covering a given
// service in a given city/area.
export async function notifyProfessionalsInCity(service: string | string[], city: string | string[], message?: string) {
  const services = Array.isArray(service) ? service : [service];
  const cities = Array.isArray(city) ? city : [city];

  const phones = await fetchActiveProfessionalPhones(services, cities);
  if (phones.length === 0) {
    throw new Error('No matching professionals found for that service/city.');
  }

  await sendNotification(
    {
      include_aliases: { external_id: phones },
      target_channel: 'push',
      headings: { en: 'New Opportunity' },
      contents: { en: message || `New "${services.join(', ')}" work available in ${cities.join(', ')}.` },
    },
    { requireSession: true, log: { title: 'notifyProfessionalsInCity', audience: 'professional', audienceService: services.join(','), audienceCity: cities.join(',') } }
  );
}

// A new booking was created — alert active professionals in that service/area.
export async function pushAreaProfessionals(service: string, area: string, customerName?: string, city?: string, bookingId?: string) {
  const phones = await fetchActiveProfessionalPhones([service], city ? [city] : [area]);
  if (phones.length === 0) return;

  await sendNotification(
    {
      include_aliases: { external_id: phones },
      target_channel: 'push',
      headings: { en: '🚀 New Job Available!' },
      contents: { en: `New "${service}" booking${customerName ? ` from ${customerName}` : ''} in ${area}.` },
      data: { screen: bookingId ? '/admin/BookingDetails_1' : '/admin/BookingHistory', bookingId },
    },
    { log: { title: 'pushAreaProfessionals', audience: 'professional', audienceService: service, audienceCity: city || area } }
  );
}

// A different professional/staff member accepted the booking — tell the rest
// of the matching pool it's no longer available.
export async function notifyProfessionalsAccepted(service: string, city: string, area: string, excludePhone?: string, acceptedByName?: string) {
  const phones = (await fetchActiveProfessionalPhones([service], [city, area])).filter((p) => p !== excludePhone);
  if (phones.length === 0) return;

  await sendNotification(
    {
      include_aliases: { external_id: phones },
      target_channel: 'push',
      headings: { en: 'Job No Longer Available' },
      contents: { en: `The "${service}" job in ${area} has been accepted${acceptedByName ? ` by ${acceptedByName}` : ''}.` },
    },
    { log: { title: 'notifyProfessionalsAccepted', audience: 'professional', audienceService: service, audienceCity: city } }
  );
}

// A booking was rejected/resubmitted — re-broadcast to the matching pool.
export async function notifyProfessionalsRejected(service: string, city: string, excludePhone?: string, bookingId?: string, customerName?: string, area?: string) {
  const phones = (await fetchActiveProfessionalPhones([service], [city, area].filter(Boolean) as string[])).filter((p) => p !== excludePhone);
  if (phones.length === 0) return;

  await sendNotification(
    {
      include_aliases: { external_id: phones },
      target_channel: 'push',
      headings: { en: '🚀 Job Available Again' },
      contents: { en: `A "${service}" booking${customerName ? ` from ${customerName}` : ''} is available again.` },
      data: { screen: bookingId ? '/admin/BookingDetails_1' : '/admin/BookingHistory', bookingId },
    },
    { log: { title: 'notifyProfessionalsRejected', audience: 'professional', audienceService: service, audienceCity: city } }
  );
}

// Manual staff broadcast to customers who've booked a given service before.
// booking.select_services is a real Postgres array (confirmed against live
// data) — some historical rows have stray quote characters inside the
// service name strings from earlier data-entry bugs, so this is a best-effort
// match against current, cleanly-written bookings rather than a guaranteed
// full match against every historical row.
export async function notifyCustomersByService(service: string | string[], title: string, message: string) {
  const services = Array.isArray(service) ? service : [service];

  const { data, error } = await supabase.from('booking').select('phone').overlaps('select_services', services);
  if (error) {
    console.log('notifyCustomersByService fetch error:', error.message);
    return;
  }

  const phones = Array.from(new Set((data ?? []).map((row: any) => row.phone).filter(Boolean)));
  if (phones.length === 0) {
    throw new Error('No matching customers found for that service.');
  }

  await sendNotification(
    {
      include_aliases: { external_id: phones },
      target_channel: 'push',
      headings: { en: title },
      contents: { en: message },
    },
    { requireSession: true, log: { title, body: message, audience: 'customer', audienceService: services.join(',') } }
  );
}

// Manual staff broadcast to every admin/superadmin device — unrestricted
// reach within the staff pool, so it requires a superadmin session.
export async function notifyAdminsBroadcast(title: string, message: string) {
  await sendNotification(
    {
      filters: [{ field: 'tag', key: 'role', relation: '=', value: 'admin' }],
      headings: { en: title },
      contents: { en: message },
    },
    { requireSession: true, log: { title, body: message, audience: 'admin' } }
  );
}

// Manual staff broadcast to every install that never registered a role tag
// (anonymous, not-yet-signed-in installs) — broadest possible reach, requires
// a superadmin session.
export async function notifyPublic(title: string, message: string) {
  await sendNotification(
    {
      filters: [{ field: 'tag', key: 'role', relation: 'not_exists' }],
      headings: { en: title },
      contents: { en: message },
    },
    { requireSession: true, log: { title, body: message, audience: 'public' } }
  );
}

// Manual staff broadcast to customers generally (role='user' tag, no service
// filter) — distinct from notifyCustomersByService's targeted variant.
export async function notifyCustomers(title: string, message: string) {
  await sendNotification(
    {
      filters: [{ field: 'tag', key: 'role', relation: '=', value: 'user' }],
      headings: { en: title },
      contents: { en: message },
    },
    { requireSession: true, log: { title, body: message, audience: 'customer' } }
  );
}
