# Junk Junkies Florida
Static site + `/api/lead` serverless form handler (deploy on Vercel).

**Env vars**: `RESEND_API_KEY`, `LEAD_EMAIL_TO` (Aaron's email, TBD), `LEAD_EMAIL_FROM`, `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_FROM` (texts leads to `LEAD_SMS_TO` (set in env, never in code)).
**Media**: `VENICE_API_KEY=... node scripts/generate-media.mjs models` then run without args. Saves to `assets/`. Hero video: `assets/hero.mp4`.
