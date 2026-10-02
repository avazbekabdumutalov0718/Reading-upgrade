# Telegram sign-in — setup (about 10 minutes)

This lets a user tap "Log in with Telegram" and land signed in, without you
running your own bot server. Telegram's official Login Widget does the
identity check on Telegram's side; this Edge Function double-checks that
signature (never trust it unverified) and turns it into a real Supabase
session.

## 1. Create the bot
1. In Telegram, message **@BotFather** → `/newbot` → follow the prompts.
2. Note the **bot token** it gives you (looks like `123456789:AA...`).
3. Still in BotFather: `/setdomain` → choose your bot → enter the exact
   domain your site is served from (e.g. `vividielts.uz`, or
   `127.0.0.1:5500` while testing locally — Telegram does allow localhost
   domains for widget testing).

## 2. Deploy the Edge Function
```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set TELEGRAM_BOT_TOKEN=123456789:AA...your-token
supabase functions deploy telegram-auth
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically —
you don't set those yourself.

## 3. Run the schema update
In the Supabase SQL editor, re-run `schema.sql` (it's safe to run again —
the new parts use `if not exists`). This adds a `telegram_id` column to
`profiles` so a Telegram account can be linked to a profile row.

## 4. Turn the widget on
In `supabase-config.js`, set:
```js
const TELEGRAM_BOT_USERNAME = 'your_bot_username'; // no @
```
That's it — `auth.js` will swap the placeholder "Telegram" button for
Telegram's real widget automatically once this is set.

## How it works
1. User taps the Telegram widget → a Telegram popup confirms their
   identity → Telegram calls back into the page with a signed payload
   (id, name, `auth_date`, `hash`).
2. The page sends that payload to the `telegram-auth` Edge Function.
3. The function recomputes the HMAC-SHA256 hash using your bot token
   (kept server-side only) and rejects anything that doesn't match or is
   older than 5 minutes — this is what stops someone from faking or
   replaying a Telegram login.
4. On a valid payload, it finds or creates the matching Supabase user
   (linked via `profiles.telegram_id`) and returns a one-time sign-in
   link, which the browser follows to become a normal authenticated
   session — from then on it behaves exactly like an email/password or
   Google user.

## Why this couldn't be done purely in the browser
Verifying a Telegram login requires the bot token, and anything sent to
the browser can be read by the browser. If the verification ran client-side,
anyone could fabricate a valid-looking payload for any Telegram account.
That's why this step lives in an Edge Function instead of `auth.js`.
