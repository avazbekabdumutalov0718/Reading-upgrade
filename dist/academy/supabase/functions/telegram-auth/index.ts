// Supabase Edge Function: telegram-auth
//
// Verifies the payload sent by the Telegram Login Widget (this is the ONLY
// place that is allowed to trust "this really is Telegram user X", because
// it's the only place that holds the bot token secret) and then either
// creates or logs in the matching Supabase user, returning a one-time
// action_link the browser can redirect to to become signed in.
//
// Deploy:
//   supabase functions deploy telegram-auth
// Secrets (Project Settings → Edge Functions → Secrets, or via CLI):
//   supabase secrets set TELEGRAM_BOT_TOKEN=123456:ABC-yourBotFatherToken
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are already available
//    automatically inside every Edge Function.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function sha256(input: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', input));
}

async function hmacSha256(key: Uint8Array, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Telegram's own verification recipe: https://core.telegram.org/widgets/login#checking-authorization
async function verifyTelegramPayload(payload: Record<string, unknown>): Promise<boolean> {
  const { hash, ...rest } = payload as Record<string, string>;
  if (!hash) return false;

  // auth_date must be recent (5 minutes) so an intercepted payload can't be replayed later.
  const authDate = Number(rest.auth_date || 0);
  if (!authDate || Date.now() / 1000 - authDate > 300) return false;

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join('\n');

  const secretKey = await sha256(new TextEncoder().encode(TELEGRAM_BOT_TOKEN));
  const computedHash = await hmacSha256(secretKey, dataCheckString);
  return computedHash === hash;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const ok = await verifyTelegramPayload(payload);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'Invalid or expired Telegram signature.' }), { status: 401 });
    }

    const telegramId = Number(payload.id);
    const fullName = [payload.first_name, payload.last_name].filter(Boolean).join(' ') || payload.username || 'IELTS Student';

    // A synthetic, never-shown email so Telegram-only users still fit Supabase's
    // email-based auth model. It is never sent anywhere or displayed to the user.
    const syntheticEmail = `telegram-${telegramId}@telegram.vividielts.local`;

    // Do we already have a profile linked to this Telegram account?
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegramId)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.id;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: { full_name: fullName, telegram_id: telegramId },
      });
      if (createErr) throw createErr;
      userId = created.user.id;
      await admin.from('profiles').update({ telegram_id: telegramId, full_name: fullName }).eq('id', userId);
    }

    // Mint a one-time magic link the browser can follow to become an authenticated session.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail,
    });
    if (linkErr) throw linkErr;

    return new Response(JSON.stringify({ action_link: linkData.properties.action_link }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), { status: 500 });
  }
});
