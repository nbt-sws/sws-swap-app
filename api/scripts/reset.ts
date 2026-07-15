import { Client } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const client = new Client(DATABASE_URL);
await client.connect();

// Drop cards from tenant schema (it was created there by mistake)
await client.query('DROP TABLE IF EXISTS tenant_default.cards CASCADE');
console.log('✓ Dropped tenant_default.cards');

// Also drop and recreate tenant schema tables to ensure clean state
await client.query('DROP TABLE IF EXISTS tenant_default.offers CASCADE');
await client.query('DROP TABLE IF EXISTS tenant_default.orders CASCADE');
await client.query('DROP TABLE IF EXISTS tenant_default.listings CASCADE');
await client.query('DROP TABLE IF EXISTS tenant_default.vault_items CASCADE');
await client.query('DROP TABLE IF EXISTS tenant_default.users CASCADE');
console.log('✓ Dropped all tenant tables');

await client.end();
