// Supabase Edge Function: resolve-username
//
// Lets the website log a user in with a USERNAME instead of an email.
// Supabase Auth only knows how to sign in with an email, so this function
// looks the username up in public.profiles (using the service-role key,
// bypassing RLS) and returns the account's internal, never-shown email.
// The browser then calls supabase.auth.signInWithPassword() with that email.
//
// This function does NOT check the password and does NOT log anyone in by
// itself — it only reveals which (synthetic) email a username maps to, so
// the normal password check still happens in Supabase Auth afterwards.
//
// Deploy:
//   supabase functions deploy resolve-username

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
    const { username } = await req.json();
    const clean = String(username || '').trim().toLowerCase().replace(/^@+/, '');

    if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
      return new Response(JSON.stringify({ error: "That doesn't look like a valid username." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile, error: lookupErr } = await admin
      .from('profiles')
      .select('id, telegram_id')
      .eq('username', clean)
      .maybeSingle();

    if (lookupErr) throw lookupErr;

    if (!profile) {
      return new Response(JSON.stringify({ error: 'No account found with that username.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let email: string;

    if (profile.telegram_id) {
      // Telegram-based accounts always use this deterministic synthetic email.
      email = `telegram-${profile.telegram_id}@telegram.vividielts.local`;
    } else {
      // Fallback for non-Telegram accounts: look the real email up via Admin API.
      const { data: userData, error: userErr } = await admin.auth.admin.getUserById(profile.id);
      if (userErr || !userData?.user?.email) {
        return new Response(JSON.stringify({ error: 'Could not resolve this account.' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      email = userData.user.email;
    }

    return new Response(JSON.stringify({ email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});