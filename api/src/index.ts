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

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'https://swibswap.app', 'https://www.swibswap.app', 'https://*.vercel.app', 'https://sws-demo-nine.vercel.app'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
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

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

export default app;
