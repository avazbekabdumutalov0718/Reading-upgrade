# Telegram sign-in via bot code — setup

The user sends `/login` to @vividielts_bot (or taps "🔐 Saytga kirish kodi" in
the bot menu). The bot makes up a 6-digit code, writes it to Supabase, and
sends it to the user. The user types that code into the site, which asks
this Edge Function to check it and sign them in. No Telegram widget, no
BotFather `/setdomain` needed — it works on any domain, including
`127.0.0.1` while testing locally.

## 1. Run the schema update
In the Supabase SQL editor, re-run `schema.sql` (safe to re-run — it only
adds things that don't already exist). This creates the
`telegram_login_codes` table the bot writes codes into.

## 2. Deploy this function
```bash
supabase functions deploy telegram-code-login
```
No new secrets needed — it reuses `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`, which every Edge Function already has.

## 3. Update the bot
Replace your bot's `bot.js` with the updated version (adds the `/login`
command and a "🔐 Saytga kirish kodi" button, using the same
`SUPABASE_SERVICE_ROLE_KEY` the bot already has). Redeploy on Render as
usual (push to the bot's repo, or upload the file — however you deploy it
today).

## How it works
1. User sends `/login` → bot generates a random 6-digit code and inserts a
   row into `telegram_login_codes` (code, telegram_id, full_name,
   expires_at = now + 5 minutes) using its service-role key.
2. Bot sends the code back to the user in the chat.
3. User types the code into the site's Telegram panel → the site calls this
   function with `{ code }`.
4. This function checks the code exists, is unused, and hasn't expired,
   marks it used, then finds or creates the matching Supabase user (linked
   via `profiles.telegram_id`) and returns a one-time sign-in link.
5. The browser follows that link and becomes a normal authenticated
   session — same as an email/password or Google user from then on.

## Why the code can't be checked in the browser
Only the bot (with its bot token) and this function (with the service-role
key) can be trusted to say "this code is genuinely tied to this Telegram
account." Checking it client-side would mean shipping a secret key to every
visitor's browser, which anyone could then use to forge access.
