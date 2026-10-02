# VIVID IELTS — Google login setup (current Supabase project)

The site keeps the current cloud database project from `dist/supabase-config.js` so existing progress tables and RLS continue to work. The old SITE project is **not** substituted, because its Google session cannot read/write the current project’s tables.

## Enable Google on the current project
1. Open Supabase → Authentication → Providers → Google.
2. Enable Google.
3. In Google Cloud create/use a Web OAuth client.
4. Add this Supabase callback URI to Google Authorized redirect URIs:
   `https://opsyyvuvhdqikmuwfnkz.supabase.co/auth/v1/callback`
5. Put the Google Client ID and Client Secret into the Supabase Google provider settings and Save.
6. Supabase → Authentication → URL Configuration: set the deployed VIVID IELTS URL as Site URL. Add local development URLs such as `http://127.0.0.1:5500/**` and `http://localhost:5500/**` only for development, plus the final Vercel/production URL.

No new SQL table is needed for Google login. The existing RLS rules use `auth.uid()`, so email/password and Google sessions both save to the same user-scoped tables. If an email/password identity and Google identity are not automatically linked by Supabase, they can appear as separate user IDs; for one continuous history, use the same existing account/session or configure identity linking in Supabase.

Never put the Google Client Secret in frontend JavaScript or in this ZIP.
