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

  if (body.requireSession) {
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
    body: JSON.stringify({ app_id: appId, ...body.payload }),
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
