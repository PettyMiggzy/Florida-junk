import { sql, init, isAdmin, body } from './_lib.js';
const num = v => (v === '' || v == null ? null : Number(v));
const ts = v => (v ? new Date(v).toISOString() : null);
export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'auth' });
  await init();
  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM jobs ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT 1000`;
    return res.status(200).json({ jobs: rows });
  }
  const b = body(req);
  if (req.method === 'DELETE') { await sql`DELETE FROM jobs WHERE id=${Number(req.query.id)}`; return res.status(200).json({ ok: true }); }
  if (req.method === 'POST' || req.method === 'PUT') {
    const completed = b.status === 'completed' ? (ts(b.completed_at) || new Date().toISOString()) : null;
    const v = [b.name, b.phone, b.email, b.address, b.city, b.service, b.details, b.status || 'lead', ts(b.scheduled_at), completed, num(b.price), b.notes, num(b.lat), num(b.lng), !!b.published, b.title, b.photo || null];
    if (b.id) {
      const r = await sql`UPDATE jobs SET name=${v[0]},phone=${v[1]},email=${v[2]},address=${v[3]},city=${v[4]},service=${v[5]},details=${v[6]},status=${v[7]},scheduled_at=${v[8]},completed_at=${v[9]},price=${v[10]},notes=${v[11]},lat=${v[12]},lng=${v[13]},published=${v[14]},title=${v[15]},photo=${v[16]} WHERE id=${Number(b.id)} RETURNING *`;
      return res.status(200).json({ job: r[0] });
    }
    const r = await sql`INSERT INTO jobs (name,phone,email,address,city,service,details,status,scheduled_at,completed_at,price,notes,lat,lng,published,title,photo) VALUES (${v[0]},${v[1]},${v[2]},${v[3]},${v[4]},${v[5]},${v[6]},${v[7]},${v[8]},${v[9]},${v[10]},${v[11]},${v[12]},${v[13]},${v[14]},${v[15]},${v[16]}) RETURNING *`;
    return res.status(200).json({ job: r[0] });
  }
  res.status(405).end();
}
