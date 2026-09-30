# Junk Junkies Florida
Static site. Form posts via FormSubmit.co to junkjunkiesflorida@gmail.com (no account/API key).
First submission sends an activation email to that inbox — click the confirm link once.
Media: `node scripts/generate-media.mjs models` (needs VENICE_API_KEY in .env, gitignored).

## Admin (`/admin`)
Password-gated command center: schedule, map, all jobs, leads from the site form, publish completed jobs to the public map.
Env vars (Vercel): `DATABASE_URL` (Neon Postgres), `ADMIN_PASSWORD`, `SESSION_SECRET` (any long random string).
Table is created automatically on first request.

## Google reviews
Find the Place ID at https://developers.google.com/maps/documentation/places/web-service/place-id and set `GOOGLE_PLACE_ID` in `main.js`.
