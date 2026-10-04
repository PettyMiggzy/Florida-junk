import { readDb, writeDb, body } from './_lib.js';
// Optional text-message alert to the owner. Active only when TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM and NOTIFY_TO (comma-separated numbers) are set.
export async function notifySms(text) {
  const { TWILIO_SID: sid, TWILIO_TOKEN: tok, TWILIO_FROM: from, NOTIFY_TO: to } = process.env;
  if (!sid || !tok || !from || !to) return;
  await Promise.all(to.split(',').map(n => n.trim()).filter(Boolean).map(n =>
    fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: 'POST',
      headers: { Authorization: 'Basic ' + Buffer.from(sid + ':' + tok).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: from, To: n, Body: text.slice(0, 600) }) }).catch(() => {})));
}

// Public: website form submissions land in the admin as "lead" jobs.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = body(req), c = v => String(v || '').slice(0, 1500);
  if (!c(b.name) || !c(b.phone)) return res.status(400).json({ error: 'missing' });
  await notifySms(`New quote (florida): ${c(b.name)} ${c(b.phone)}${b.service ? ' | ' + c(b.service) : ''}${b.city ? ' | ' + c(b.city) : ''}${b.details ? ' | ' + c(b.details).slice(0, 300) : ''}`);
  const db = await readDb();
  if (db.jobs.length > 5000) return res.status(429).end();
  db.jobs.push({
    id: db.next++, created_at: new Date().toISOString(), name: c(b.name), phone: c(b.phone), email: c(b.email),
    address: '', city: c(b.city), service: c(b.service), details: c(b.details) + (b.timing ? ' | Timing: ' + c(b.timing) : ''),
    status: 'lead', scheduled_at: null, completed_at: null, price: null, notes: '', lat: null, lng: null, published: false, title: '', photo: null,
  });
  await writeDb(db);
  res.status(200).json({ ok: true });
}
