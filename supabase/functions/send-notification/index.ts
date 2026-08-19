// Holds the OneSignal REST key server-side (previously shipped client-side in
// api/notifications.ts as EXPO_PUBLIC_ONESIGNAL_REST_API_KEY — same class of
// exposure as the Sparrow token fixed earlier this session). Every push in the
// app now routes through here.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

interface SendNotificationRequest {
  // Passed straight through to OneSignal's /notifications API — filters,
  // included_segments, include_aliases, headings, contents, etc.
  payload: Record<string, unknown>;
  // Caller sets this for anything with unrestricted reach (broadcast to every
  // admin device, every installed app with no role tag, etc.) — the narrow,
  // system-triggered notifications (booking accepted, helpbox alert, a push
  // to one specific phone-tagged customer) don't set it, since those already
  // fire from ordinary user-facing screens with no staff session available.
  requireSession?: boolean;
  // Optional audit fields, logged to public.notifications alongside every send.
  log?: {
    title?: string;
    body?: string;
    screen?: string;
    linkId?: string;
    audience?: string;
    audienceService?: string;
    audienceCity?: string;
    audiencePhone?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, 405);
  }

  let body: SendNotificationRequest;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  if (!body?.payload) {
    return json({ success: false, error: 'payload is required' }, 400);
  }

  // requireSession is caller-supplied and not real authorization on its own —
  // a request holding just the app's public anon key can set it to false (or
  // omit it) and reach OneSignal directly. Force a session for any payload
  // shape that can reach an unbounded audience, regardless of what the caller
  // claims: `included_segments` (e.g. ['All']) is never used by any of the
  // narrow, system-triggered call sites in api/notifications.ts — only
  // notifyAll, which already sets requireSession — so gating on its mere
  // presence can't break a legitimate no-session caller. Same for a
  // `not_exists` filter (every install with no role tag at all), used only by
  // notifyPublic, which also already sets requireSession.
  //
  // A `filters` array that reduces to exactly one bare tag-equality condition
  // (no AND/OR, nothing else) reaches every device carrying that one tag —
  // e.g. every customer (notifyCustomers) or every admin (notifyAdminsBroadcast),
  // both of which already require a session at their real call sites. This
  // exact shape is never produced by any no-session caller: the ones that
  // also filter on a bare role either OR in a second role (notifyAdminHelpbox:
  // admin OR superadmin) or AND in a phone/service/area condition
  // (notifyUsers/notifyJobCompleted: role AND phone; notifyProfessionals'
  // only real call site always supplies both service and area) — so this
  // can't misfire against a legitimate no-session send.
  const payload = (body.payload ?? {}) as Record<string, unknown>;
  const filters = Array.isArray(payload.filters) ? payload.filters : [];
  const isBareSingleCondition =
    filters.length === 1 && (filters[0] as any)?.field === 'tag' && (filters[0] as any)?.relation === '=';
  const hasUnboundedReach =
    'included_segments' in payload ||
    filters.some((f: any) => f?.relation === 'not_exists') ||
    isBareSingleCondition;

  if (body.requireSession || hasUnboundedReach) {
    const session = await verifyAdminSession(req);
    if (!session || session.role !== 'superadmin') {
      return json({ success: false, error: 'Superadmin session required' }, 401);
    }
  }

  const appId = Deno.env.get('ONESIGNAL_APP_ID');
  const restApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

  if (!appId || !restApiKey) {
    console.log('[send-notification] skipped: missing OneSignal config');
    return json({ success: false, error: 'Notifications not configured' }, 500);
  }

  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Key ${restApiKey}`,
      'Content-Type': 'application/json',
    },
    // app_id spread last so a caller-supplied app_id in payload can never
    // override the real one.
    body: JSON.stringify({ ...payload, app_id: appId }),
  });

  const responseBody = await response.text();
  if (!response.ok) {
    console.error('[send-notification] OneSignal error:', response.status, responseBody);
    return json({ success: false, error: 'Notification provider error' }, 502);
  }

  if (body.log) {
    const { error: logError } = await supabaseAdmin.from('notifications').insert({
      title: body.log.title ?? null,
      body: body.log.body ?? null,
      screen: body.log.screen ?? null,
      link_id: body.log.linkId ?? null,
      audience: body.log.audience ?? null,
      audience_service: body.log.audienceService ?? null,
      audience_city: body.log.audienceCity ?? null,
      audience_phone: body.log.audiencePhone ?? null,
    });
    if (logError) console.error('[send-notification] failed to log history:', logError);
  }

  return json({ success: true }, 200);
});
