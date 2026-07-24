import { Client } from '@neondatabase/serverless';

const c = new Client(process.env.DATABASE_URL);
await c.connect();
const r = await c.query('SELECT code, lang, rarity, status, LEFT(image_url, 60) as img FROM public.community_samples');
console.log(JSON.stringify(r.rows, null, 1));
const r2 = await c.query("SELECT DISTINCT ON (UPPER(code)) code, LEFT(image_url,60) as img FROM public.community_samples WHERE UPPER(code) = ANY($1) AND status = 'APPROVED'", [['OP01-016']]);
console.log('match:', JSON.stringify(r2.rows));
await c.end();
