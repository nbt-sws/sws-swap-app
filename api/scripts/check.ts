import { Client } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const client = new Client(DATABASE_URL);
await client.connect();
const { rows } = await client.query("SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'cards'");
console.log('Cards tables:', rows);
await client.query("SET search_path = tenant_default, public");
const { rows: cols } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'cards' LIMIT 5");
console.log('Columns:', cols);
await client.end();
