import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant } from '../db';
import type { Env } from '../db';
import { optionalAuth } from '../middleware/auth';

const listingSchema = z.object({
  itemId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().min(0),
  currency: z.string().default('THB'),
  category: z.string().optional(),
  itemFormat: z.enum(['SALE', 'TRADE']).default('SALE'),
  condition: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const marketRoutes = new Hono<{ Bindings: Env }>();
marketRoutes.use('*', optionalAuth);

// GET /api/v1/market/listings
marketRoutes.get('/listings', async (c) => {
  const tenantId = c.get('tenantId');
  const status = c.req.query('status') || 'ACTIVE';
  const category = c.req.query('category');
  const minPrice = c.req.query('minPrice');
  const maxPrice = c.req.query('maxPrice');
  const sellerId = c.req.query('sellerId');
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100);
  const offset = parseInt(c.req.query('offset') || '0');

  const listings = await withTenant(c.env, tenantId, async (client) => {
    const params: (string | number)[] = [status];
    let sql = `
      SELECT l.*, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
             c.rarity, c.type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition
      FROM listings l
      LEFT JOIN cards c ON l.item_id = c.id
      WHERE l.status = $1
    `;
    let paramIndex = 2;

    if (category) {
      sql += ` AND l.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (minPrice) {
      sql += ` AND l.price >= $${paramIndex}`;
      params.push(parseInt(minPrice));
      paramIndex++;
    }
    if (maxPrice) {
      sql += ` AND l.price <= $${paramIndex}`;
      params.push(parseInt(maxPrice));
      paramIndex++;
    }
    if (sellerId) {
      sql += ` AND l.seller_id = $${paramIndex}`;
      params.push(sellerId);
      paramIndex++;
    }

    sql += ` ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await client.query(sql, params);
    return rows;
  });

  return c.json({
    listings: listings.map((l: any) => ({
      listingId: l.listing_id,
      itemId: l.item_id,
      sellerId: l.seller_id,
      title: l.title,
      description: l.description,
      price: l.price,
      currency: l.currency,
      status: l.status,
      category: l.category,
      subCategory: l.sub_category,
      itemFormat: l.item_format,
      condition: l.condition,
      imageUrl: l.image_url,
      sellerDisplayName: l.seller_display_name,
      sellerAvatarUrl: l.seller_avatar_url,
      sellerBio: l.seller_bio,
      sellerTier: l.seller_tier,
      ownerId: l.owner_id,
      holderId: l.holder_id,
      views: l.views,
      watchers: l.watchers,
      isFeatured: l.is_featured,
      createdAt: l.created_at,
    })),
  });
});

// GET /api/v1/market/listings/:id
marketRoutes.get('/listings/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const listingId = c.req.param('id');

  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT l.*, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
              c.rarity, c.type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition
       FROM listings l
       LEFT JOIN cards c ON l.item_id = c.id
       WHERE l.listing_id = $1`,
      [listingId]
    );
    return rows;
  });

  const listing = listings[0];
  if (!listing) {
    return c.json({ error: 'Listing not found' }, 404);
  }

  return c.json({
    listingId: listing.listing_id,
    itemId: listing.item_id,
    sellerId: listing.seller_id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    currency: listing.currency,
    status: listing.status,
    category: listing.category,
    subCategory: listing.sub_category,
    itemFormat: listing.item_format,
    condition: listing.condition,
    imageUrl: listing.image_url,
    sellerDisplayName: listing.seller_display_name,
    sellerAvatarUrl: listing.seller_avatar_url,
    sellerBio: listing.seller_bio,
    sellerTier: listing.seller_tier,
    ownerId: listing.owner_id,
    holderId: listing.holder_id,
    views: listing.views,
    watchers: listing.watchers,
    isFeatured: listing.is_featured,
    createdAt: listing.created_at,
  });
});

// POST /api/v1/market/listings
marketRoutes.post('/listings', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;

  if (data.itemId) {
    const items = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        'SELECT id, status FROM vault_items WHERE id = $1 AND owner_id = $2',
        [data.itemId, userId]
      );
      return rows;
    });

    if (!items.length) {
      return c.json({ error: 'Vault item not found or not owned by user' }, 404);
    }

    await withTenant(c.env, tenantId, async (client) => {
      await client.query("UPDATE vault_items SET status = 'LOCKED' WHERE id = $1", [data.itemId]);
    });
  }

  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows: userRows } = await client.query('SELECT name, tier FROM users WHERE id = $1', [userId]);
    const user = userRows[0];

    const { rows } = await client.query(
      `INSERT INTO listings (item_id, seller_id, title, description, price, currency, status, category, item_format, condition, image_url, seller_display_name, seller_tier, owner_id, holder_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE', $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [data.itemId || null, userId, data.title, data.description || null, data.price, data.currency, data.category || null, data.itemFormat || null, data.condition || null, data.imageUrl || null, user?.name || null, user?.tier || null, userId, userId]
    );
    return rows;
  });

  const listing = listings[0];
  return c.json({ listingId: listing.listing_id, message: 'Listing created' }, 201);
});

// PATCH /api/v1/market/listings/:id
marketRoutes.patch('/listings/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const allowedUpdates = ['status', 'price', 'title', 'description', 'image_url'];
  const updates: string[] = [];
  const values: (string | number)[] = [];
  let paramIndex = 1;

  for (const key of allowedUpdates) {
    if (body[key] !== undefined) {
      updates.push(`${key} = $${paramIndex}`);
      values.push(body[key]);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  values.push(listingId);
  values.push(userId);

  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE listings SET ${updates.join(', ')} WHERE listing_id = $${paramIndex} AND seller_id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return rows;
  });

  const result = listings[0];
  if (!result) {
    return c.json({ error: 'Listing not found or not owned by user' }, 404);
  }

  if (body.status === 'INACTIVE' || body.status === 'SOLD' || body.status === 'DELISTED') {
    if (result.item_id) {
      await withTenant(c.env, tenantId, async (client) => {
        await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [result.item_id]);
      });
    }
  }

  return c.json({ listingId: result.listing_id, message: 'Listing updated' });
});

// POST /api/v1/market/listings/:id/activate
marketRoutes.post('/listings/:id/activate', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      "UPDATE listings SET status = 'ACTIVE' WHERE listing_id = $1 AND seller_id = $2 RETURNING *",
      [listingId, userId]
    );
    return rows;
  });

  const result = listings[0];
  if (!result) {
    return c.json({ error: 'Listing not found or not owned by user' }, 404);
  }

  return c.json({ listingId: result.listing_id, status: 'ACTIVE' });
});

// DELETE /api/v1/market/listings/:id
marketRoutes.delete('/listings/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const listingId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const listings = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'SELECT item_id FROM listings WHERE listing_id = $1 AND seller_id = $2',
      [listingId, userId]
    );
    const itemId = rows[0]?.item_id;

    const { rows: deleted } = await client.query(
      'DELETE FROM listings WHERE listing_id = $1 AND seller_id = $2 RETURNING listing_id',
      [listingId, userId]
    );

    if (itemId && deleted.length) {
      await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [itemId]);
    }

    return deleted;
  });

  if (!listings.length) {
    return c.json({ error: 'Listing not found or not owned by user' }, 404);
  }

  return c.json({ message: 'Listing deleted' });
});
