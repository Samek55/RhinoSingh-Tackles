// Any staff role. Lists the notification send-log (public.notifications) for
// ViewNotifications.tsx — that table has RLS on with zero anon/authenticated
// policies (only the service role, i.e. send-notification, can touch it), so
// there's no way for the client to read it directly.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { verifyAdminSession } from '../_shared/adminSession.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const session = await verifyAdminSession(req);
  if (!session) {
    return json({ success: false, error: 'Session required' }, 401);
  }

  const { data: notifications, error } = await supabaseAdmin
    .from('notifications')
    .select('id, title, body, screen, link_id, audience, audience_service, audience_city, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[list-notifications] fetch failed:', error);
    return json({ success: false, error: 'Internal error' }, 500);
  }

  return json({ success: true, notifications: notifications ?? [] }, 200);
});
