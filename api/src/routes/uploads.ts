import { Hono } from 'hono';
import type { Env } from '../db';
import { authMiddleware, optionalAuth } from '../middleware/auth';

export const uploadRoutes = new Hono<{ Bindings: Env }>();

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

// POST /api/v1/uploads — multipart form-data, field "file" (auth required)
uploadRoutes.post('/uploads', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const formData = await c.req.formData().catch(() => null);
  const file = formData?.get('file');
  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file provided (expected field "file")' }, 400);
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return c.json({ error: 'Unsupported file type. Use JPEG, PNG, WebP or AVIF.' }, 400);
  }
  if (file.size > MAX_SIZE) {
    return c.json({ error: 'File too large (max 5MB)' }, 400);
  }

  const key = `${tenantId}/${userId}/${crypto.randomUUID()}.${ext}`;
  await c.env.IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  const origin = new URL(c.req.url).origin;
  return c.json({ url: `${origin}/api/v1/images/${key}`, key }, 201);
});

// GET /api/v1/images/* — public read, immutable cache (keys are unique per upload)
uploadRoutes.get('/images/*', optionalAuth, async (c) => {
  const key = c.req.path.replace(/^\/api\/v1\/images\//, '');
  if (!key || key.includes('..')) {
    return c.json({ error: 'Invalid key' }, 400);
  }

  const obj = await c.env.IMAGES.get(key);
  if (!obj) {
    return c.json({ error: 'Not found' }, 404);
  }

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('ETag', obj.httpEtag);
  return new Response(obj.body, { headers });
});
