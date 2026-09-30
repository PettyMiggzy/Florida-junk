import { sql, init } from './_lib.js';
// Public: only completed jobs the owner chose to publish. Location is fuzzed to ~1km, no customer details.
export default async function handler(req, res) {
  await init();
  const rows = await sql`SELECT id, title, service, city, completed_at, lat, lng, photo FROM jobs WHERE published AND status='completed' AND lat IS NOT NULL ORDER BY completed_at DESC NULLS LAST LIMIT 200`;
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ jobs: rows.map(r => ({ ...r, lat: Math.round(r.lat * 100) / 100, lng: Math.round(r.lng * 100) / 100 })) });
}
