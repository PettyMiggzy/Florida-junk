// Vercel serverless function. Sends each lead to Aaron by email (Resend) and SMS (Twilio).
// Env: RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, LEAD_SMS_TO (Aaron's cell, set in env only)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (b.company) return res.status(200).json({ ok: true }); // honeypot
  const clean = v => String(v || '').slice(0, 1000);
  const { name, phone, email, city, details, timing } = Object.fromEntries(Object.entries(b).map(([k, v]) => [k, clean(v)]));
  if (!name || !phone || !city || !details) return res.status(400).json({ error: 'missing fields' });
  const text = `NEW JUNK LEAD\n${name} ${phone}\n${email || ''}\n${city}\nWhen: ${timing}\n${details}`;
  const jobs = [];
  if (process.env.RESEND_API_KEY)
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM || 'leads@resend.dev', to: (process.env.LEAD_EMAIL_TO || 'junkjunkiesflorida@gmail.com').split(','), subject: `New junk lead: ${name} (${city})`, text }),
    }));
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM && process.env.LEAD_SMS_TO)
    jobs.push(fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_SID}/Messages.json`, {
      method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(`${process.env.TWILIO_SID}:${process.env.TWILIO_TOKEN}`).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ To: process.env.LEAD_SMS_TO, From: process.env.TWILIO_FROM, Body: text }),
    }));
  if (!jobs.length) { console.log(text); return res.status(503).json({ error: 'no delivery configured' }); }
  const r = await Promise.allSettled(jobs);
  const ok = r.some(x => x.status === 'fulfilled' && x.value.ok);
  return res.status(ok ? 200 : 502).json({ ok });
}
