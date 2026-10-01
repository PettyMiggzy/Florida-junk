# Junk Junkies Florida
Static site. Form posts via FormSubmit.co to junkjunkiesflorida@gmail.com (no account/API key).
First submission sends an activation email to that inbox — click the confirm link once.
Media: `node scripts/generate-media.mjs models` (needs VENICE_API_KEY in .env, gitignored).

## Admin (`/admin`)
Password-gated command center: schedule, map, all jobs, leads from the site form, publish completed jobs to the public map.
Storage: private Vercel Blob store `junk-junkies-data` (BLOB_READ_WRITE_TOKEN). Env vars: `ADMIN_PASSWORD`, `SESSION_SECRET`.

## Google reviews
Find the Place ID at https://developers.google.com/maps/documentation/places/web-service/place-id and set `GOOGLE_PLACE_ID` in `main.js`.

## SEO
`python3 scripts/build_seo.py` regenerates `/services/*`, `/areas/*`, `sitemap.xml`, `robots.txt` from `scripts/seo_data.py`.
Edit copy/cities/services in `seo_data.py`, re-run, commit. Canonical domain is `SITE` in that file.
