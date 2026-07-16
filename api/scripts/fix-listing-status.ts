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

  // Update vault items that are LOCKED but have an active listing to LISTING
  const { rowCount } = await client.query(`
    UPDATE vault_items v
    SET status = 'LISTING'
    FROM listings l
    WHERE v.id = l.item_id
      AND v.status = 'LOCKED'
      AND l.status = 'ACTIVE'
  `);
  console.log(`Updated ${rowCount} vault items from LOCKED to LISTING (have active listings)`);

  // Show remaining LOCKED items (user-locked, not listing)
  const { rows } = await client.query(`
    SELECT v.id, v.name, v.status, v.owner_id
    FROM vault_items v
    WHERE v.status = 'LOCKED'
  `);
  console.log('\nRemaining LOCKED items (user-locked):');
  rows.forEach(r => console.log(r));

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
