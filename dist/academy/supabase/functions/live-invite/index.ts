// Supabase Edge Function: live-invite
//
// Called by the broadcast HOST (must be logged in with profiles.is_admin =
// true) when they tap "🎤 Taklif qilish" next to a viewer. It writes a
// short-lived, single-use row into live_invites, which is what lets that one
// viewer's next livekit-token request come back with canPublish = true.
//
// Without this server-side check, any viewer could just call livekit-token
// directly and ask for publish rights for themselves — this function is what
// makes sure only an admin can hand out the "you may turn your camera on"
// permission, and only to the specific person they picked.
//
// Deploy:
//   supabase functions deploy live-invite
// Uses the same secrets as livekit-token (SUPABASE_URL / SERVICE_ROLE_KEY are
// automatic; no LiveKit secrets needed here).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const bearer = authHeader.replace(/^Bearer\s+/i, '');
    if (!bearer) return json({ error: 'Not logged in.' }, 401);

    const { data: userData } = await admin.auth.getUser(bearer);
    if (!userData.user) return json({ error: 'Not logged in.' }, 401);

    const { data: profile } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', userData.user.id)
      .maybeSingle();
    if (!profile?.is_admin) return json({ error: 'Only the admin can invite viewers to speak.' }, 403);

    const { roomName, inviteeIdentity } = await req.json();
    if (!roomName || !inviteeIdentity) {
      return json({ error: 'roomName and inviteeIdentity are required' }, 400);
    }

    const { error } = await admin.from('live_invites').insert({
      room_name: roomName,
      invitee_identity: inviteeIdentity,
      invited_by: userData.user.id,
    });
    if (error) throw error;

    return json({ success: true });
  } catch (err) {
    return json({ error: String((err as Error)?.message || err) }, 500);
  }
});
