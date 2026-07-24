import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './db';
import { tenantMiddleware } from './middleware/tenant';
import { authMiddleware, optionalAuth } from './middleware/auth';
import { authRoutes } from './routes/auth';
import { vaultRoutes } from './routes/vault';
import { marketRoutes } from './routes/market';
import { orderRoutes } from './routes/orders';
import { offerRoutes } from './routes/offers';
import { miscRoutes } from './routes/misc';
import { uploadRoutes } from './routes/uploads';
import { storeRoutes } from './routes/stores';
import { serviceRoutes } from './routes/services';
import { scanRoutes } from './routes/scan';
import { priceRoutes } from './routes/prices';
import { scannerRoutes } from './routes/scanner';
import { catalogRoutes } from './routes/catalog';

const app = new Hono<{ Bindings: Env }>();

// Helper to parse CORS origins from environment variable
function getCorsOrigins(env: Env): string | string[] {
  const envVar = env.CORS_ALLOWED_ORIGINS;
  
  // Default origins (development fallbacks)
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'https://swibswap.app', 'https://www.swibswap.app', 'https://*.vercel.app', 'https://sws-demo-nine.vercel.app'];
  
  if (!envVar || envVar.trim() === '') {
    // Empty + non-prod = allow all
    if (env.ENVIRONMENT !== 'production') {
      return '*';
    }
    // In production with empty CORS_ALLOWED_ORIGINS, use defaults
    return defaultOrigins;
  }
  
  // Parse comma-separated origins
  return envVar.split(',').map(o => o.trim()).filter(o => o.length > 0);
}

// Global middleware
app.use('*', logger());
app.use('*', (c, next) => {
  const origins = getCorsOrigins(c.env);
  return cors({
    origin: origins,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next);
});
app.use('*', tenantMiddleware);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }));

// Auth routes (no auth required for login/register)
app.route('/api/v1', authRoutes);

// Protected routes
app.route('/api/v1/vault', vaultRoutes);
app.route('/api/v1/market', marketRoutes);
app.route('/api/v1/orders', orderRoutes);
app.route('/api/v1/offers', offerRoutes);
app.route('/api/v1', miscRoutes);
app.route('/api/v1', uploadRoutes);
app.route('/api/v1', storeRoutes);
app.route('/api/v1', scanRoutes);
app.route('/api/v1', priceRoutes);
app.route('/api/v1', scannerRoutes);
app.route('/api/v1', catalogRoutes);
app.route('/api/v1', serviceRoutes);

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;
