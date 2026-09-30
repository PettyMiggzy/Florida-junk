import { readDb, writeDb, body } from './_lib.js';
// Public: website form submissions land in the admin as "lead" jobs.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = body(req), c = v => String(v || '').slice(0, 1500);
  if (!c(b.name) || !c(b.phone)) return res.status(400).json({ error: 'missing' });
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
