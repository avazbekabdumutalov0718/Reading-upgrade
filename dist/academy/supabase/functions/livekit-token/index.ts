// Supabase Edge Function: livekit-token
//
// Mints a LiveKit access token (JWT) for the caller. This is the ONLY place
// that is allowed to hold LIVEKIT_API_SECRET, so it's the only place that can
// decide whether someone is allowed to *publish* (turn their camera on) into
// a room, vs. only *subscribe* (watch). The browser can never be trusted with
// that decision on its own.
//
// Rules enforced here:
//   - Anyone (even a logged-out guest) can get a subscribe-only token, so
//     watching a broadcast never requires an account.
//   - A publish-capable token for the HOST role is only minted for a
//     logged-in user whose profiles.is_admin = true.
//   - A publish-capable token for a GUEST speaker (someone the host invited
//     mid-broadcast) is only minted if there's a matching, unused, unexpired
//     row in live_invites created by an admin via the live-invite function.
//
// Deploy:
//   supabase functions deploy livekit-token
// Secrets (Project Settings -> Edge Functions -> Secrets, or via CLI):
//   supabase secrets set LIVEKIT_URL=wss://your-project.livekit.cloud
//   supabase secrets set LIVEKIT_API_KEY=APIxxxxxxxx
//   supabase secrets set LIVEKIT_API_SECRET=yourSecretHere
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already available
//    automatically inside every Edge Function.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL')!;
const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY')!;
const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET')!;

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

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signLiveKitJwt(payload: Record<string, unknown>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encHeader = base64url(new TextEncoder().encode(JSON.stringify(header)));
  const encPayload = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${encHeader}.${encPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(LIVEKIT_API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput)));
  return `${signingInput}.${base64url(sig)}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const { roomName, identity: guestIdentity, name: guestName, wantPublish } = await req.json();

    if (!roomName || typeof roomName !== 'string') {
      return json({ error: 'roomName is required' }, 400);
    }

    // Figure out who's asking. A real Supabase session takes priority; if
    // there isn't one, fall back to the guest identity/name the browser sent.
    let identity: string;
    let displayName: string;
    let isAdmin = false;

    const authHeader = req.headers.get('Authorization') || '';
    const bearer = authHeader.replace(/^Bearer\s+/i, '');
    let authedUser: { id: string } | null = null;
    if (bearer) {
      const { data } = await admin.auth.getUser(bearer);
      authedUser = data.user ? { id: data.user.id } : null;
    }

    if (authedUser) {
      identity = authedUser.id;
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name, is_admin')
        .eq('id', authedUser.id)
        .maybeSingle();
      displayName = profile?.full_name || 'IELTS Student';
      isAdmin = !!profile?.is_admin;
    } else {
      if (!guestIdentity || typeof guestIdentity !== 'string') {
        return json({ error: 'identity is required for guests' }, 400);
      }
      identity = guestIdentity;
      displayName = (typeof guestName === 'string' && guestName) || 'IELTS Student';
    }

    let canPublish = false;

    if (wantPublish) {
      if (isAdmin) {
        // The admin is starting/hosting the broadcast — always allowed.
        canPublish = true;
      } else {
        // A viewer trying to publish must have a live, unused invite from
        // the host for this exact room + identity.
        const { data: invite } = await admin
          .from('live_invites')
          .select('id')
          .eq('room_name', roomName)
          .eq('invitee_identity', identity)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (invite) {
          await admin.from('live_invites').update({ used: true }).eq('id', invite.id);
          canPublish = true;
        }
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: LIVEKIT_API_KEY,
      sub: identity,
      iat: now,
      nbf: now,
      exp: now + 60 * 60 * 4, // 4 hours
      name: displayName,
      video: {
        room: roomName,
        roomJoin: true,
        canPublish,
        canPublishData: true,
        canSubscribe: true,
        // Only an actual publisher needs to be able to update its own
        // metadata (e.g. mute state); harmless to leave on for everyone.
        canUpdateOwnMetadata: true,
      },
    };

    const token = await signLiveKitJwt(payload);

    return json({ token, url: LIVEKIT_URL, identity, name: displayName, isAdmin, canPublish });
  } catch (err) {
    return json({ error: String((err as Error)?.message || err) }, 500);
  }
});
