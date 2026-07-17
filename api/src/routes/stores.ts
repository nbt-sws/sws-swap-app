import { Hono } from 'hono';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware, optionalAuth } from '../middleware/auth';

export const storeRoutes = new Hono<{ Bindings: Env }>();
storeRoutes.use('*', optionalAuth);

/* eslint-disable @typescript-eslint/no-explicit-any */

const mapGroup = (r: any) => ({
  id: r.id,
  name: r.name,
  cardCodes: Array.isArray(r.card_codes) ? r.card_codes : [],
});

const mapReview = (r: any) => ({
  id: r.id,
  storeId: r.store_id,
  reviewerName: r.reviewer_name || `User ${String(r.reviewer_id).slice(0, 6)}`,
  rating: r.rating,
  comment: r.comment ?? '',
  createdAt: r.created_at,
});

// ─── Store groups ────────────────────────────────────────────────────

// GET /api/v1/stores/:userId/groups (public)
storeRoutes.get('/stores/:userId/groups', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('userId');
  const groups = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM store_groups WHERE user_id = $1 ORDER BY sort_order, created_at',
      [userId]
    );
    return rows.map(mapGroup);
  });
  return c.json({ groups });
});

// PUT /api/v1/stores/me/groups (owner) — replace all groups atomically
storeRoutes.put('/stores/me/groups', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const groups: { id?: string; name: string; cardCodes?: string[] }[] = Array.isArray(body.groups) ? body.groups : [];

  const saved = await withTenant(c.env, tenantId, async (client) => {
    await client.query('DELETE FROM store_groups WHERE user_id = $1', [userId]);
    const inserted = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (!g.name?.trim()) continue;
      const { rows } = await client.query(
        'INSERT INTO store_groups (user_id, name, card_codes, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, g.name.trim(), JSON.stringify(g.cardCodes ?? []), i]
      );
      inserted.push(rows[0]);
    }
    return inserted;
  });

  return c.json({ groups: saved.map(mapGroup) });
});

// ─── Store reviews ───────────────────────────────────────────────────

// GET /api/v1/stores/:storeId/reviews (public)
storeRoutes.get('/stores/:storeId/reviews', async (c) => {
  const tenantId = c.get('tenantId');
  const storeId = c.req.param('storeId');
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT r.*, u.name as reviewer_name
       FROM store_reviews r
       LEFT JOIN users u ON r.reviewer_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    return rows;
  });
  const reviews = result.map(mapReview);
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : null;
  return c.json({ reviews, count, average });
});

// POST /api/v1/stores/:storeId/reviews (auth; requires a completed order with the store)
storeRoutes.post('/stores/:storeId/reviews', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const storeId = c.req.param('storeId');
  if (storeId === userId) {
    return c.json({ error: 'Cannot review your own store' }, 400);
  }

  const body = await c.req.json();
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return c.json({ error: 'Rating must be an integer between 1 and 5' }, 400);
  }
  const comment = typeof body.comment === 'string' ? body.comment.slice(0, 1000) : '';

  const review = await withTenant(c.env, tenantId, async (client) => {
    // Trust gate: reviewer must have a completed order from this store
    const { rows: orderRows } = await client.query(
      "SELECT 1 FROM orders WHERE buyer_id = $1 AND seller_id = $2 AND status = 'COMPLETED' LIMIT 1",
      [userId, storeId]
    );
    if (!orderRows.length) {
      return { error: 'You can review a store after completing an order with them' as const };
    }

    const { rows } = await client.query(
      `INSERT INTO store_reviews (store_id, reviewer_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (store_id, reviewer_id)
       DO UPDATE SET rating = $3, comment = $4, updated_at = NOW()
       RETURNING *`,
      [storeId, userId, rating, comment]
    );
    return { row: rows[0] };
  });

  if ('error' in review) {
    return c.json({ error: review.error }, 403);
  }
  return c.json(mapReview(review.row), 201);
});
