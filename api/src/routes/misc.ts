import { Hono } from 'hono';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware, optionalAuth } from '../middleware/auth';

export const miscRoutes = new Hono<{ Bindings: Env }>();
miscRoutes.use('*', optionalAuth);

// ─── Row mappers (snake_case DB rows → camelCase API contract) ────────

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapWishlistItem = (r: any) => ({
  id: r.id,
  buyerId: r.buyer_id,
  listingId: r.listing_id,
  createdAt: r.created_at,
});

const mapNotification = (r: any) => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  body: r.body,
  channel: r.channel,
  eventType: r.event_type,
  readAt: r.read_at ?? undefined,
  createdAt: r.created_at,
});

const mapFollow = (r: any) => ({
  id: r.id,
  followerId: r.follower_id,
  followingId: r.following_id,
  createdAt: r.created_at,
});

const mapRedemption = (r: any) => ({
  id: r.id,
  itemId: r.item_id,
  userId: r.user_id,
  status: r.status,
  shippingAddress: r.shipping_address,
  trackingNumber: r.tracking_number ?? undefined,
  createdAt: r.created_at,
  completedAt: r.completed_at ?? undefined,
});

const mapVaultDelivery = (r: any) => ({
  id: r.id,
  itemId: r.item_id,
  userId: r.user_id,
  status: r.status,
  shippingAddress: r.shipping_address,
  trackingNumber: r.tracking_number ?? undefined,
  createdAt: r.created_at,
});

const mapAuditEntry = (r: any) => ({
  id: r.id,
  itemId: r.item_id ?? undefined,
  userId: r.user_id ?? undefined,
  eventType: r.event_type,
  actorId: r.actor_id ?? 'system',
  previousState: r.previous_state,
  newState: r.new_state,
  occurredAt: r.occurred_at ?? r.created_at,
});

// Wishlist
miscRoutes.get('/wishlist', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM wishlist WHERE buyer_id = $1 ORDER BY created_at DESC', [userId]);
    return rows.map(mapWishlistItem);
  });
  return c.json({ items });
});

miscRoutes.post('/wishlist/:listingId', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('listingId');
  const item = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `INSERT INTO wishlist (listing_id, buyer_id) VALUES ($1, $2)
       ON CONFLICT (buyer_id, listing_id) DO NOTHING
       RETURNING *`,
      [listingId, userId]
    );
    if (rows[0]) return rows[0];
    // Already wishlisted — return the existing row
    const { rows: existing } = await client.query(
      'SELECT * FROM wishlist WHERE listing_id = $1 AND buyer_id = $2',
      [listingId, userId]
    );
    return existing[0];
  });
  return c.json(mapWishlistItem(item), 201);
});

miscRoutes.delete('/wishlist/:listingId', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('listingId');
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('DELETE FROM wishlist WHERE listing_id = $1 AND buyer_id = $2', [listingId, userId]);
  });
  return c.json({ status: 'removed' });
});

// Notifications
miscRoutes.get('/notifications', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const notifications = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows.map(mapNotification);
  });
  return c.json({ notifications });
});

miscRoutes.patch('/notifications/:id/read', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('UPDATE notifications SET read_at = NOW() WHERE id = $1', [id]);
  });
  return c.json({ status: 'read' });
});

// Collectors / Stores
const COLLECTOR_SELECT = `
  SELECT u.id, u.name, u.tier, u.avatar_url, u.bio, u.banner_url, u.location, u.social_links, u.created_at,
    (SELECT COUNT(*)::int FROM listings l WHERE l.seller_id = u.id AND l.status = 'ACTIVE') as listed_items,
    (SELECT COUNT(*)::int FROM orders o WHERE o.seller_id = u.id) as sold_items,
    (SELECT COUNT(*)::int FROM follows f WHERE f.following_id = u.id) as followers
  FROM users u`;

const mapCollectorProfile = (r: any) => ({
  userId: r.id,
  displayName: r.name,
  bio: r.bio ?? undefined,
  avatarUrl: r.avatar_url ?? undefined,
  bannerUrl: r.banner_url ?? undefined,
  address: r.location ? { street: r.location } : undefined,
  socialLinks: r.social_links ?? undefined,
  stats: {
    listedItems: r.listed_items ?? 0,
    soldItems: r.sold_items ?? 0,
    followers: r.followers ?? 0,
  },
  memberSince: r.created_at,
});

miscRoutes.get('/collectors', async (c) => {
  const tenantId = c.get('tenantId');
  const sellers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${COLLECTOR_SELECT} WHERE u.tier IN ($1, $2)`, ['MEMBER', 'SUBSCRIBER']);
    return rows.map(mapCollectorProfile);
  });
  return c.json({ sellers });
});

miscRoutes.get('/collectors/:userId', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('userId');
  const profile = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${COLLECTOR_SELECT} WHERE u.id = $1`, [userId]);
    return rows[0] ? mapCollectorProfile(rows[0]) : null;
  });
  if (!profile) return c.json({ error: 'Not found' }, 404);
  return c.json(profile);
});

miscRoutes.put('/collectors/me', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const body = await c.req.json();
  const profile = await withTenant(c.env, tenantId, async (client) => {
    await client.query(
      `UPDATE users SET
         name = COALESCE($1, name),
         bio = COALESCE($2, bio),
         avatar_url = COALESCE($3, avatar_url),
         banner_url = COALESCE($4, banner_url),
         location = COALESCE($5, location),
         social_links = COALESCE($6::jsonb, social_links)
       WHERE id = $7`,
      [
        body.displayName ?? body.name ?? null,
        body.bio ?? null,
        body.avatarUrl ?? null,
        body.bannerUrl ?? null,
        body.location ?? null,
        body.socialLinks ? JSON.stringify(body.socialLinks) : null,
        userId,
      ]
    );
    const { rows } = await client.query(`${COLLECTOR_SELECT} WHERE u.id = $1`, [userId]);
    return rows[0] ? mapCollectorProfile(rows[0]) : null;
  });
  return c.json(profile);
});

// Follows
miscRoutes.post('/follows', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const { followingId } = await c.req.json();
  await withTenant(c.env, tenantId, async (client) => {
    await client.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT (follower_id, following_id) DO NOTHING',
      [userId, followingId]
    );
  });
  return c.json({ status: 'followed' }, 201);
});

miscRoutes.delete('/follows/:followingId', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const followingId = c.req.param('followingId');
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [userId, followingId]);
  });
  return c.json({ status: 'unfollowed' });
});

miscRoutes.get('/follows', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const follows = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM follows WHERE follower_id = $1', [userId]);
    return rows.map(mapFollow);
  });
  return c.json({ follows });
});

// Redemptions
miscRoutes.get('/redemptions', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const redemptions = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM redemptions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows.map(mapRedemption);
  });
  return c.json({ redemptions });
});

// Vault Deliveries
miscRoutes.get('/vault-deliveries', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const deliveries = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM vault_deliveries WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows.map(mapVaultDelivery);
  });
  return c.json({ deliveries });
});

// Audit
miscRoutes.get('/audit/items/:itemId', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const itemId = c.req.param('itemId');
  const history = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM audit_log WHERE item_id = $1 ORDER BY created_at DESC', [itemId]);
    return rows.map(mapAuditEntry);
  });
  return c.json({ itemId, history });
});

miscRoutes.get('/audit/users/:userId', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.req.param('userId');
  const history = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT * FROM audit_log WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows.map(mapAuditEntry);
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
      'SELECT price, traded_at FROM price_history WHERE sku = $1 AND ($2::text IS NULL OR period = $2) ORDER BY traded_at DESC',
      [sku, period || null]
    );
    return rows.map((r: any) => ({ time: r.traded_at, price: r.price }));
  });
  return c.json({ sku, period: period || '30d', trades });
});

miscRoutes.get('/market/:sku/stats', async (c) => {
  const tenantId = c.get('tenantId');
  const sku = c.req.param('sku');
  const stats = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT MIN(price)::int as min_price, MAX(price)::int as max_price, AVG(price)::int as avg_price, COUNT(*)::int as count,
        (SELECT price FROM price_history WHERE sku = $1 ORDER BY traded_at DESC LIMIT 1) as last_sold
       FROM price_history WHERE sku = $1`,
      [sku]
    );
    return rows[0];
  });
  return c.json({
    sku,
    lastSold: stats?.last_sold ?? undefined,
    avgPrice: stats?.avg_price ?? undefined,
    minPrice: stats?.min_price ?? undefined,
    maxPrice: stats?.max_price ?? undefined,
    count: stats?.count ?? 0,
  });
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

miscRoutes.post('/kyc/submit', authMiddleware, async (c) => {
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

miscRoutes.post('/campaigns/:slug/claim', authMiddleware, async (c) => {
  return c.json({ success: false });
});

miscRoutes.get('/campaigns/my', authMiddleware, async (c) => {
  return c.json({ campaigns: [] });
});

// Achievements
miscRoutes.get('/achievements', async (c) => {
  return c.json({ achievements: [] });
});

miscRoutes.get('/achievements/:slug', async (c) => {
  return c.json({ achievement: null });
});

miscRoutes.get('/achievements/my', authMiddleware, async (c) => {
  return c.json({ achievements: [] });
});

miscRoutes.post('/achievements/:slug/progress', authMiddleware, async (c) => {
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

miscRoutes.post('/users/me/badges/equip', authMiddleware, async (c) => {
  return c.json({ status: 'equipped' });
});

// Platform stats
miscRoutes.get('/platform/stats', async (c) => {
  const tenantId = c.get('tenantId');
  const stats = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM users) as total_users,
         (SELECT COUNT(*)::int FROM listings) as total_listings,
         (SELECT COUNT(*)::int FROM orders) as total_orders,
         (SELECT COALESCE(SUM(price), 0)::bigint FROM orders) as total_volume`
    );
    return rows[0];
  });
  return c.json({
    totalUsers: stats.total_users,
    totalListings: stats.total_listings,
    totalOrders: stats.total_orders,
    totalVolume: Number(stats.total_volume),
  });
});

// Shipments
miscRoutes.get('/shipments/:orderId', authMiddleware, async (c) => {
  return c.json({});
});

miscRoutes.get('/shipments/:id/track', authMiddleware, async (c) => {
  return c.json({ timeline: [] });
});

// Collector profile avatar/banner (stub)
miscRoutes.post('/collector-profiles/avatar', authMiddleware, async (c) => {
  return c.json({ avatarUrl: '' });
});

miscRoutes.post('/collector-profiles/banner', authMiddleware, async (c) => {
  return c.json({ bannerUrl: '' });
});
