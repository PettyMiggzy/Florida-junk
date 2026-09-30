import { readDb, writeDb, isAdmin, body } from './_lib.js';
const num = v => (v === '' || v == null ? null : Number(v));
const ts = v => (v ? new Date(v).toISOString() : null);
export default async function handler(req, res) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'auth' });
  const db = await readDb();
  if (req.method === 'GET') {
    const key = j => new Date(j.scheduled_at || j.created_at).getTime();
    return res.status(200).json({ jobs: [...db.jobs].sort((a, b) => key(b) - key(a)) });
  }
  if (req.method === 'DELETE') {
    db.jobs = db.jobs.filter(j => j.id !== Number(req.query.id));
    await writeDb(db);
    return res.status(200).json({ ok: true });
  }
  if (req.method === 'POST' || req.method === 'PUT') {
    const b = body(req), old = db.jobs.find(j => j.id === Number(b.id));
    const status = b.status || 'lead';
    const job = {
      id: old?.id ?? db.next++, created_at: old?.created_at ?? new Date().toISOString(),
      name: b.name || '', phone: b.phone || '', email: b.email || '', address: b.address || '', city: b.city || '',
      service: b.service || '', details: b.details || '', status, scheduled_at: ts(b.scheduled_at),
      completed_at: status === 'completed' ? (old?.completed_at || new Date().toISOString()) : null,
      price: num(b.price), notes: b.notes || '', lat: num(b.lat), lng: num(b.lng),
      published: !!b.published, title: b.title || '', photo: b.photo || null,
    };
    db.jobs = old ? db.jobs.map(j => (j.id === old.id ? job : j)) : [...db.jobs, job];
    await writeDb(db);
    return res.status(200).json({ job });
  }
  res.status(405).end();
}
