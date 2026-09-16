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

### Web Analytics

Public pages include Vercel's plain HTML Web Analytics snippet. This project does not use React or Next.js, so no Analytics component or npm package is needed.

Enable **Web Analytics** for the project in the Vercel dashboard, then deploy the changes. Visit the deployed site and navigate between pages; check the Analytics dashboard after about 30 seconds. If no data appears, check content blockers and confirm `/_vercel/insights/script.js` loads successfully. The tracking endpoint is provided by Vercel and is not available from the local Express server.

See the [Vercel Web Analytics quickstart](https://vercel.com/docs/analytics/quickstart) for details.

### Deployment steps

1. Push this repository to GitHub and import it into Vercel.
2. Leave the Framework Preset as **Other**. The included `vercel.json` supplies the routes and serverless-function settings.
3. In **Project Settings → Environment Variables**, add `DATABASE_URL` for Production, Preview, and Development as appropriate. Use the Supabase pooler connection string and URL-encode reserved password characters.
4. Deploy the project.
5. Open `/api/health`; a working deployment returns `{"ok":true,"database":"connected"}`.
6. Submit a test request through `/book`, then confirm the new row in `public.booking_requests` in Supabase.

The table migration has already been applied to the current Supabase project. For a different project, set its `DATABASE_URL` locally and run `npm run db:migrate` before accepting bookings.

Vercel builds must never receive a committed `.env` file. Use encrypted Vercel environment variables instead. Rotate any database password that has been shared outside the hosting secret store.
