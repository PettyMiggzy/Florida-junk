import { body, checkPassword, makeToken, isAdmin } from './_lib.js';
export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ ok: isAdmin(req) });
  if (req.method === 'DELETE') { res.setHeader('Set-Cookie', 'jj_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'); return res.status(200).json({ ok: true }); }
  if (req.method !== 'POST') return res.status(405).end();
  if (!checkPassword(body(req).password)) { await new Promise(r => setTimeout(r, 800)); return res.status(401).json({ error: 'Wrong password' }); }
  const token = makeToken();
  res.setHeader('Set-Cookie', `jj_admin=${token}; Path=/; Max-Age=${7 * 86400}; HttpOnly; Secure; SameSite=Lax`);
  res.status(200).json({ ok: true, token });
}
