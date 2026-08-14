// Deletes the caller's admin_sessions row if present. A missing/invalid
// token isn't an error state here — logging out an already-logged-out
// session should still report success.
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const token = req.headers.get('x-admin-session-token');
  if (token) {
    const { error } = await supabaseAdmin.from('admin_sessions').delete().eq('token', token);
    if (error) console.error('[logout] delete failed:', error);
  }

  return json({ success: true }, 200);
});
