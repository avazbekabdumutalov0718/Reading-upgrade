// Supabase Edge Function: telegram-code-login
//
// The bot (@vividielts_bot, /login command) generates a random 6-digit code
// and writes it to public.telegram_login_codes using its service-role key.
// This function is what the WEBSITE calls once the user types that code in:
// it checks the code is real, unused and not expired, marks it used, then
// finds or creates the matching Supabase user and returns a one-time sign-in
// link the browser can follow.
//
// Deploy:
//   supabase functions deploy telegram-code-login
// (No new secrets needed — it reuses SUPABASE_URL and
//  SUPABASE_SERVICE_ROLE_KEY, which every Edge Function already has.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();
    const cleanCode = String(code || '').trim();

    if (!/^\d{6}$/.test(cleanCode)) {
      return new Response(JSON.stringify({ error: "That doesn't look like a 6-digit code." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: row, error: lookupErr } = await admin
      .from('telegram_login_codes')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (lookupErr) throw lookupErr;

    if (!row) {
      return new Response(JSON.stringify({ error: 'That code is not valid. Ask the bot for a new one.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (row.used) {
      return new Response(JSON.stringify({ error: 'That code has already been used. Ask the bot for a new one.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: 'That code has expired. Ask the bot for a new one.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark the code used immediately so it can't be replayed.
    await admin.from('telegram_login_codes').update({ used: true }).eq('code', cleanCode);

    const telegramId = row.telegram_id;
    const fullName = row.full_name || 'IELTS Student';

    // A synthetic, never-shown email so Telegram-only users still fit Supabase's
    // email-based auth model. It is never sent anywhere or displayed to the user.
    const syntheticEmail = `telegram-${telegramId}@telegram.vividielts.local`;

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

    const SITE_URL = Deno.env.get('SITE_URL') || 'https://vividielt-ss.vercel.app';
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: syntheticEmail,
      options: { redirectTo: `${SITE_URL}/dashboard.html` },
    });
    if (linkErr) throw linkErr;

    return new Response(JSON.stringify({ action_link: linkData.properties.action_link }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
