import { readDb } from './_lib.js';
// Public: only completed jobs the owner chose to publish. Location is fuzzed to ~1km, no customer details.
export default async function handler(req, res) {
  const { jobs } = await readDb();
  const pub = jobs.filter(j => j.published && j.status === 'completed' && j.lat != null)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)).slice(0, 200)
    .map(j => ({ id: j.id, title: j.title, service: j.service, city: j.city, completed_at: j.completed_at, photo: j.photo,
      lat: Math.round(j.lat * 100) / 100, lng: Math.round(j.lng * 100) / 100 }));
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ jobs: pub });
}
