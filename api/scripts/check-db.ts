import { Client } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

async function main() {
  const client = new Client(DATABASE_URL);
  await client.connect();
  await client.query('SET search_path = tenant_default, public');

  console.log('=== All vault items ===');
  const { rows: vault } = await client.query('SELECT id, owner_id, status, name FROM vault_items ORDER BY name');
  vault.forEach(v => console.log(v));

  console.log('\n=== All listings ===');
  const { rows: listings } = await client.query('SELECT listing_id, item_id, seller_id, title, status FROM listings ORDER BY title');
  listings.forEach(l => console.log(l));

  console.log('\n=== LOCKED vault items without matching listing ===');
  const { rows: orphaned } = await client.query(`
    SELECT v.id, v.name, v.owner_id, v.status
    FROM vault_items v
    LEFT JOIN listings l ON v.id = l.item_id
    WHERE v.status = 'LOCKED' AND l.listing_id IS NULL
  `);
  orphaned.forEach(o => console.log(o));
  if (orphaned.length === 0) console.log('(none)');

  console.log('\n=== Listings with item_id not in vault ===');
  const { rows: badListings } = await client.query(`
    SELECT l.listing_id, l.item_id, l.title, l.seller_id
    FROM listings l
    LEFT JOIN vault_items v ON l.item_id = v.id
    WHERE l.item_id IS NOT NULL AND v.id IS NULL
  `);
  badListings.forEach(b => console.log(b));
  if (badListings.length === 0) console.log('(none)');

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
