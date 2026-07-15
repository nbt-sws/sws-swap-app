import { Client } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL required');
  process.exit(1);
}

const client = new Client(DATABASE_URL);
await client.connect();
await client.query('SET search_path = tenant_default, public');
const { rows } = await client.query('SELECT id, email FROM users');
console.log('Users:', rows);
await client.end();
