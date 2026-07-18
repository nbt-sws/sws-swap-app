import { Pool } from '@neondatabase/serverless';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  IMAGES: R2Bucket;
  ANTHROPIC_API_KEY: string;
  EBAY_APP_ID: string;
  EBAY_CERT_ID: string;
}

type DbClient = InstanceType<typeof Pool.prototype.connect>;

/** Insert an in-app notification for a user (fire-and-forget within the request txn). */
export async function notify(
  client: DbClient,
  userId: string,
  title: string,
  body: string,
  eventType: string
): Promise<void> {
  await client.query(
    "INSERT INTO notifications (user_id, title, body, channel, event_type) VALUES ($1, $2, $3, 'IN_APP', $4)",
    [userId, title, body, eventType]
  );
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
