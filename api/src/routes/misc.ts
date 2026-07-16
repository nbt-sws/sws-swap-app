import { Hono } from 'hono';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

export const miscRoutes = new Hono<{ Bindings: Env }>();
miscRoutes.use('*', authMiddleware);

// Wishlist
miscRoutes.get('/wishlist', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM wishlist WHERE buyer_id = $1', [userId]);
    return rows;
  });
  return c.json({ items });
});

miscRoutes.post('/wishlist/:listingId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('listingId');
  const item = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'INSERT INTO wishlist (listing_id, buyer_id) VALUES ($1, $2) RETURNING *',
      [listingId, userId]
    );
    return rows[0];
  });
  return c.json(item, 201);
});

miscRoutes.delete('/wishlist/:listingId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('listingId');
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('DELETE FROM wishlist WHERE listing_id = $1 AND buyer_id = $2', [listingId, userId]);
  });
  return c.json({ status: 'removed' });
});

// Notifications
miscRoutes.get('/notifications', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const notifications = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows;
  });
  return c.json({ notifications });
});

miscRoutes.patch('/notifications/:id/read', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('UPDATE notifications SET read_at = NOW() WHERE id = $1', [id]);
  });
  return c.json({ status: 'read' });
});

// Collectors / Stores
miscRoutes.get('/collectors', async (c) => {
  const tenantId = c.get('tenantId');
  const sellers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT id, name, tier, avatar_url FROM users WHERE tier IN ($1, $2)', ['MEMBER', 'SUBSCRIBER']);
    return rows;
  });
  return c.json({ sellers });
});

miscRoutes.get('/collectors/:userId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('userId');
  const profile = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT id, name, email, tier, kyc_status, avatar_url FROM users WHERE id = $1', [userId]);
    return rows[0] || null;
  });
  if (!profile) return c.json({ error: 'Not found' }, 404);
  return c.json(profile);
});

miscRoutes.put('/collectors/me', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const profile = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'UPDATE users SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING *',
      [body.name, body.avatarUrl, userId]
    );
    return rows[0];
  });
  return c.json(profile);
});

// Follows
miscRoutes.post('/follows', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const { followingId } = await c.req.json();
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)', [userId, followingId]);
  });
  return c.json({ status: 'followed' }, 201);
});

miscRoutes.delete('/follows/:followingId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const followingId = c.req.param('followingId');
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [userId, followingId]);
  });
  return c.json({ status: 'unfollowed' });
});

miscRoutes.get('/follows', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const follows = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM follows WHERE follower_id = $1', [userId]);
    return rows;
  });
  return c.json({ follows });
});

// Redemptions
miscRoutes.get('/redemptions', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const redemptions = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM redemptions WHERE user_id = $1', [userId]);
    return rows;
  });
  return c.json({ redemptions });
});

// Vault Deliveries
miscRoutes.get('/vault-deliveries', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const deliveries = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM vault_deliveries WHERE user_id = $1', [userId]);
    return rows;
  });
  return c.json({ deliveries });
});

// Audit
miscRoutes.get('/audit/items/:itemId', async (c) => {
  const tenantId = c.get('tenantId');
  const itemId = c.req.param('itemId');
  const history = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM audit_log WHERE item_id = $1 ORDER BY created_at DESC', [itemId]);
    return rows;
  });
  return c.json({ itemId, history });
});

miscRoutes.get('/audit/users/:userId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('userId');
  const history = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM audit_log WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows;
  });
  return c.json({ userId, history });
});

// Market history & stats
miscRoutes.get('/market/:sku/history', async (c) => {
  const tenantId = c.get('tenantId');
  const sku = c.req.param('sku');
  const period = c.req.query('period');
  const trades = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM price_history WHERE sku = $1 AND ($2::text IS NULL OR period = $2) ORDER BY traded_at DESC',
      [sku, period || null]
    );
    return rows;
  });
  return c.json({ sku, period: period || '30d', trades });
});

miscRoutes.get('/market/:sku/stats', async (c) => {
  const tenantId = c.get('tenantId');
  const sku = c.req.param('sku');
  const stats = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'SELECT MIN(price) as lowest, MAX(price) as highest, AVG(price)::int as avg, COUNT(*) as count FROM price_history WHERE sku = $1',
      [sku]
    );
    return rows[0];
  });
  return c.json({ sku, ...stats });
});

// KYC
miscRoutes.get('/kyc/status/:userId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('userId');
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT id, kyc_status, created_at, updated_at FROM users WHERE id = $1', [userId]);
    return rows[0] || null;
  });
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json({ userId: result.id, status: result.kyc_status, submittedAt: result.created_at, reviewedAt: result.updated_at });
});

miscRoutes.post('/kyc/submit', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "UPDATE users SET kyc_status = 'PENDING' WHERE id = $1 RETURNING id, kyc_status",
      [userId]
    );
    return rows[0];
  });
  return c.json({ kycId: result.id, status: result.kyc_status, message: 'KYC submitted' });
});

// Campaigns
miscRoutes.get('/campaigns', async (c) => {
  return c.json({ campaigns: [] });
});

miscRoutes.get('/campaigns/:slug', async (c) => {
  return c.json({ campaign: null });
});

miscRoutes.post('/campaigns/:slug/claim', async (c) => {
  return c.json({ success: false });
});

miscRoutes.get('/campaigns/my', async (c) => {
  return c.json({ campaigns: [] });
});

// Achievements
miscRoutes.get('/achievements', async (c) => {
  return c.json({ achievements: [] });
});

miscRoutes.get('/achievements/:slug', async (c) => {
  return c.json({ achievement: null });
});

miscRoutes.get('/achievements/my', async (c) => {
  return c.json({ achievements: [] });
});

miscRoutes.post('/achievements/:slug/progress', async (c) => {
  return c.json({ achievement: null });
});

// Badges
miscRoutes.get('/badges', async (c) => {
  return c.json({ badges: [] });
});

miscRoutes.get('/users/:userId/badges', async (c) => {
  return c.json({ badges: [] });
});

miscRoutes.get('/users/:userId/badges/equipped', async (c) => {
  return c.json({ badges: [] });
});

miscRoutes.post('/users/me/badges/equip', async (c) => {
  return c.json({ status: 'equipped' });
});

// Platform stats
miscRoutes.get('/platform/stats', async (c) => {
  return c.json({ users: 0, listings: 0, orders: 0, volume: 0 });
});

// Shipments
miscRoutes.get('/shipments/:orderId', async (c) => {
  return c.json({});
});

miscRoutes.get('/shipments/:id/track', async (c) => {
  return c.json({ timeline: [] });
});

// Collector profile avatar/banner (stub)
miscRoutes.post('/collector-profiles/avatar', async (c) => {
  return c.json({ avatarUrl: '' });
});

miscRoutes.post('/collector-profiles/banner', async (c) => {
  return c.json({ bannerUrl: '' });
});
