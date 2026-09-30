// Usage: VENICE_API_KEY=... node scripts/generate-media.mjs [models]
// `models` lists the Venice catalog so you can pick IDs; set IMAGE_MODEL / VIDEO_MODEL to override.
import { writeFile } from 'node:fs/promises';
const KEY = process.env.VENICE_API_KEY, B = 'https://api.venice.ai/api/v1';
if (!KEY) { console.error('Set VENICE_API_KEY'); process.exit(1); }
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
if (process.argv[2] === 'models') {
  for (const t of ['image', 'video']) {
    const r = await (await fetch(`${B}/models?type=${t}`, { headers: H })).json();
    console.log(t, (r.data || []).map(m => m.id).join(', '));
  }
  process.exit();
}
const model = process.env.IMAGE_MODEL || 'flux-2-max';
const L = ', shot on Canon EOS R5 35mm lens, natural light, photorealistic, candid documentary photograph, real people, realistic skin and textures, no text, no logos';
const shots = {
  hero: 'Cinematic photo of a junk removal crew in orange shirts loading a clean white truck in a sunny Florida suburban driveway with palm trees, golden hour, ultra detailed, no text',
  furniture: 'Photo of an old couch and mattress stacked curbside in Florida, bright daylight, no text',
  appliances: 'Photo of old refrigerator washer and dryer lined up in a garage ready for pickup, no text',
  cleanout: 'Photo of a cluttered garage full of boxes and junk before cleanout, no text',
  yard: 'Photo of pile of tree branches and palm fronds after storm in Florida yard, no text',
  construction: 'Photo of construction debris drywall and lumber pile, no text',
  hottub: 'Photo of old hot tub and wooden deck being demolished in backyard, no text',
};
for (const [name, prompt] of Object.entries(shots)) {
  const r = await fetch(`${B}/image/generate`, { method: 'POST', headers: H, body: JSON.stringify({ model, prompt: prompt + L, width: 1280, height: 720, format: 'jpeg', safe_mode: false }) });
  const j = await r.json();
  if (!j.images?.[0]) { console.error(name, JSON.stringify(j).slice(0, 200)); continue; }
  await writeFile(`assets/${name}.jpg`, Buffer.from(j.images[0], 'base64'));
  console.log('saved', name);
}
console.log('Video: see README (Venice video API is async: /video/queue → /video/retrieve).');
