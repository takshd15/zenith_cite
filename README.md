# Zenith website

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set `DATABASE_URL` to the server-side Supabase PostgreSQL connection string.
4. Run `npm run db:migrate` once to create `public.booking_requests`.
5. Run `npm start` and open `http://localhost:3000`.

Never place the database password in HTML or client-side JavaScript. Configure `DATABASE_URL` as a secret environment variable in the production hosting platform.

The booking endpoint saves validated requests to PostgreSQL. Sending the Calendly link by email still requires a transactional email provider or SMTP configuration; do not claim automatic email delivery until that integration is configured and tested.

## Deploy to Vercel

1. Push this repository to GitHub and import it into Vercel.
2. Leave the Framework Preset as **Other**. The included `vercel.json` supplies the routes and serverless-function settings.
3. In **Project Settings → Environment Variables**, add `DATABASE_URL` for Production, Preview, and Development as appropriate. Use the Supabase pooler connection string and URL-encode reserved password characters.
4. Deploy the project.
5. Open `/api/health`; a working deployment returns `{"ok":true,"database":"connected"}`.
6. Submit a test request through `/book`, then confirm the new row in `public.booking_requests` in Supabase.

The table migration has already been applied to the current Supabase project. For a different project, set its `DATABASE_URL` locally and run `npm run db:migrate` before accepting bookings.

Vercel builds must never receive a committed `.env` file. Use encrypted Vercel environment variables instead. Rotate any database password that has been shared outside the hosting secret store.
