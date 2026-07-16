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

  // Fix V5 (Monkey D. Luffy G5) to LOCKED since it has a listing
  const { rowCount } = await client.query(
    "UPDATE vault_items SET status = 'LOCKED' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'"
  );
  console.log(`Updated V5 status to LOCKED: ${rowCount} row(s)`);

  // Verify
  const { rows } = await client.query(
    "SELECT id, name, status FROM vault_items WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5'"
  );
  console.log('V5 after update:', rows[0]);

  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
