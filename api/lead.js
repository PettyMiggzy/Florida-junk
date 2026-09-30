import { sql, init, body } from './_lib.js';
// Public: website form submissions land in the admin as "lead" jobs.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = body(req), c = v => String(v || '').slice(0, 1500);
  if (!c(b.name) || !c(b.phone)) return res.status(400).json({ error: 'missing' });
  await init();
  await sql`INSERT INTO jobs (name,phone,email,city,service,details,status) VALUES (${c(b.name)},${c(b.phone)},${c(b.email)},${c(b.city)},${c(b.service)},${c(b.details) + (b.timing ? ' | Timing: ' + c(b.timing) : '')},'lead')`;
  res.status(200).json({ ok: true });
}
