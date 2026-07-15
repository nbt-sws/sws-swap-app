import { Client } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const TENANT_ID = process.env.TENANT_ID || 'default';
const SCHEMA_NAME = `tenant_${TENANT_ID}`;

async function runMigration(filename: string, schema: string) {
  const client = new Client(DATABASE_URL);
  await client.connect();

  try {
    // Create schema if not exists
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    console.log(`✓ Schema ${schema} ensured`);

    // Set search path for this session
    await client.query(`SET search_path = ${schema}, public`);

    // Read and execute migration
    const sqlPath = resolve(import.meta.dirname, '..', 'migrations', filename);
    const sql = readFileSync(sqlPath, 'utf-8');
    await client.query(sql);
    console.log(`✓ Migration ${filename} executed in schema ${schema}`);
  } catch (err) {
    console.error(`✗ Migration ${filename} failed:`, err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function runPublicMigration(filename: string) {
  const client = new Client(DATABASE_URL);
  await client.connect();

  try {
    // Set search path to public only
    await client.query(`SET search_path = public`);

    // Read and execute migration
    const sqlPath = resolve(import.meta.dirname, '..', 'migrations', filename);
    const sql = readFileSync(sqlPath, 'utf-8');
    await client.query(sql);
    console.log(`✓ Migration ${filename} executed in schema public`);
  } catch (err) {
    console.error(`✗ Migration ${filename} failed:`, err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log(`Running migrations for tenant: ${TENANT_ID} (schema: ${SCHEMA_NAME})`);
  await runMigration('001_initial.sql', SCHEMA_NAME);
  await runPublicMigration('002_seed_cards.sql');
  console.log('All migrations completed successfully');
}

main();
