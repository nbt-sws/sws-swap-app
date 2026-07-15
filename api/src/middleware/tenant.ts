import { Context, Next } from 'hono';
import type { Env } from '../db';

export async function tenantMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const tenantId = c.req.header('X-Tenant-ID') || 'default';
  
  // Validate tenant ID format (alphanumeric, hyphens, underscores only)
  if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    return c.json({ error: 'Invalid tenant ID' }, 400);
  }
  
  c.set('tenantId', tenantId);
  await next();
}
