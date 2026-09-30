import { get, put } from '@vercel/blob';
import { createHmac, timingSafeEqual } from 'node:crypto';

// Tiny JSON "database" stored as one private Vercel Blob (BLOB_READ_WRITE_TOKEN is set by the project's blob store).
const FILE = 'data/jobs.json';
export async function readDb() {
  const r = await get(FILE, { access: 'private', useCache: false }).catch(() => null);
  if (!r || r.statusCode !== 200) return { next: 1, jobs: [] };
  return JSON.parse(await new Response(r.stream).text());
}
export const writeDb = db =>
  put(FILE, JSON.stringify(db), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 0 });

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'unset';
const sign = v => createHmac('sha256', secret()).update(v).digest('hex');
export function makeToken() { const exp = Date.now() + 7 * 864e5; return `${exp}.${sign(String(exp))}`; }
export function isAdmin(req) {
  const m = /(?:^|;\s*)jj_admin=([^;]+)/.exec(req.headers.cookie || '');
  const bearer = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const tok = m?.[1] || bearer?.[1];
  if (!tok) return false;
  const [exp, sig] = tok.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && timingSafeEqual(a, b);
}
export function checkPassword(p) {
  const a = Buffer.from(createHmac('sha256', 'k').update(String(p)).digest('hex'));
  const b = Buffer.from(createHmac('sha256', 'k').update(String(process.env.ADMIN_PASSWORD || '\u0000')).digest('hex'));
  return process.env.ADMIN_PASSWORD && timingSafeEqual(a, b);
}
export const body = req => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});
