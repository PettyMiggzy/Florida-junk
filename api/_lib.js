import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const sql = neon(process.env.DATABASE_URL || '');
let ready;
export function init() {
  return (ready ||= sql`CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY, created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT, phone TEXT, email TEXT, address TEXT, city TEXT, service TEXT, details TEXT,
    status TEXT DEFAULT 'lead', scheduled_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
    price NUMERIC, notes TEXT, lat DOUBLE PRECISION, lng DOUBLE PRECISION,
    published BOOLEAN DEFAULT false, title TEXT, photo TEXT)`);
}

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || 'unset';
const sign = v => createHmac('sha256', secret()).update(v).digest('hex');
export function makeToken() { const exp = Date.now() + 7 * 864e5; return `${exp}.${sign(String(exp))}`; }
export function isAdmin(req) {
  const m = /(?:^|;\s*)jj_admin=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
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
