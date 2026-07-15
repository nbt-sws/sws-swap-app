import { drizzle } from 'drizzle-orm/neon-serverless';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from './schema';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
}

// Configure WebSocket for Node.js environments (local dev)
neonConfig.webSocketConstructor = ws;

// For Cloudflare Workers, use fetch-based connection
neonConfig.fetchConnectionCache = true;

const pools = new Map<string, Pool>();

export function getPool(env: Env, tenantId: string): Pool {
  const key = `${env.DATABASE_URL}#${tenantId}`;
  if (!pools.has(key)) {
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    pools.set(key, pool);
  }
  return pools.get(key)!;
}

export function getDb(env: Env, tenantId: string) {
  const pool = getPool(env, tenantId);
  return drizzle(pool, { schema });
}

export async function withTenant<T>(
  env: Env,
  tenantId: string,
  callback: (db: ReturnType<typeof getDb>) => Promise<T>
): Promise<T> {
  const schemaName = `tenant_${tenantId}`;
  const pool = getPool(env, tenantId);
  
  // Ensure schema exists
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  await pool.query(`SET search_path = ${schemaName}, public`);
  
  const db = drizzle(pool, { schema });
  return callback(db);
}
