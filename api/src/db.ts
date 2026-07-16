import { Pool } from '@neondatabase/serverless';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  IMAGES: R2Bucket;
}

export async function withTenant<T>(
  env: Env,
  tenantId: string,
  callback: (client: InstanceType<typeof Pool.prototype.connect>) => Promise<T>
): Promise<T> {
  const schema = `tenant_${tenantId}`;
  
  // Create Pool per-request (never global!)
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    // Ensure schema exists
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    
    // Set search_path for this session only
    await client.query(`SET search_path = "${schema}", public`);
    
    return await callback(client);
  } finally {
    // ALWAYS release connection and end pool
    client.release();
    await pool.end();
  }
}
