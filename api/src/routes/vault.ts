import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

const vaultItemSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['AVAILABLE', 'VAULT_HELD', 'LOCKED', 'IN_TRANSIT', 'REDEEMING', 'SUSPENDED']).default('AVAILABLE'),
  description: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  itemFormat: z.string().optional(),
  condition: z.string().optional(),
  imageUrl: z.string().optional(),
  paidPrice: z.number().int().min(0).optional(),
  currentPrice: z.number().int().min(0).optional(),
  dateAcquired: z.string().optional(),
  source: z.string().optional(),
  // Frontend sends pricing/acquisition info nested under metadata
  metadata: z.object({
    paidPrice: z.number().int().min(0).optional(),
    currentPrice: z.number().int().min(0).optional(),
    dateAcquired: z.string().optional(),
    source: z.string().optional(),
  }).passthrough().optional(),
});

export const vaultRoutes = new Hono<{ Bindings: Env }>();
vaultRoutes.use('*', authMiddleware);

// GET /api/v1/vault/items?ownerId=&status=
vaultRoutes.get('/items', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const ownerId = c.req.query('ownerId') || userId;
  const status = c.req.query('status');

  if (!ownerId) {
    return c.json({ error: 'ownerId required' }, 400);
  }

  const items = await withTenant(c.env, tenantId, async (client) => {
    const params: (string | number)[] = [ownerId];
    let sql = `
      SELECT v.*, v.card_id, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
             c.rarity, c.type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition
      FROM vault_items v
      LEFT JOIN cards c ON v.card_id = c.id
      WHERE v.owner_id = $1
    `;

    if (status) {
      sql += ` AND v.status = $2`;
      params.push(status);
    }

    sql += ` ORDER BY v.created_at DESC`;

    const { rows } = await client.query(sql, params);
    return rows;
  });

  return c.json({
    items: items.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      ownerId: item.owner_id,
      holderId: item.holder_id,
      status: item.status,
      description: item.description,
      category: item.category,
      subCategory: item.sub_category,
      itemFormat: item.item_format,
      condition: item.condition,
      imageUrl: item.image_url,
      metadata: {
        paidPrice: item.paid_price,
        dateAcquired: item.date_acquired,
        source: item.source,
      },
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      card: item.card_code ? {
        id: item.card_id,
        code: item.card_code,
        nameEn: item.card_name_en,
        nameJp: item.card_name_jp,
        rarity: item.rarity,
        type: item.type,
        language: item.language,
        game: item.game,
        imageUrl: item.card_image_url,
        condition: item.card_condition,
      } : null,
    })),
  });
});

// GET /api/v1/vault/items/:id
vaultRoutes.get('/items/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const itemId = c.req.param('id');

  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT v.*, v.card_id, c.code as card_code, c.name_en as card_name_en, c.name_jp as card_name_jp,
              c.rarity, c.type, c.language, c.game, c.image_url as card_image_url, c.condition as card_condition
       FROM vault_items v
       LEFT JOIN cards c ON v.card_id = c.id
       WHERE v.id = $1`,
      [itemId]
    );
    return rows;
  });

  const item = items[0];
  if (!item) {
    return c.json({ error: 'Item not found' }, 404);
  }

  return c.json({
    id: item.id,
    name: item.name,
    sku: item.sku,
    ownerId: item.owner_id,
    holderId: item.holder_id,
    status: item.status,
    description: item.description,
    category: item.category,
    subCategory: item.sub_category,
    itemFormat: item.item_format,
    condition: item.condition,
    imageUrl: item.image_url,
    metadata: {
      paidPrice: item.paid_price,
      dateAcquired: item.date_acquired,
      source: item.source,
    },
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    card: item.card_code ? {
      id: item.card_id,
      code: item.card_code,
      nameEn: item.card_name_en,
      nameJp: item.card_name_jp,
      rarity: item.rarity,
      type: item.type,
      language: item.language,
      game: item.game,
      imageUrl: item.card_image_url,
      condition: item.card_condition,
    } : null,
  });
});

// POST /api/v1/vault/items
vaultRoutes.post('/items', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const parsed = vaultItemSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;
  // Accept flat fields or fields nested under metadata (frontend sends metadata)
  const paidPrice = data.paidPrice ?? data.metadata?.paidPrice ?? 0;
  const currentPrice = data.currentPrice ?? data.metadata?.currentPrice ?? paidPrice;
  const dateAcquired = data.dateAcquired ?? data.metadata?.dateAcquired;
  const source = data.source ?? data.metadata?.source;

  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows: cardRows } = await client.query('SELECT id FROM cards WHERE code = $1', [data.sku]);
    const cardId = cardRows[0]?.id || null;

    const { rows } = await client.query(
      `INSERT INTO vault_items (owner_id, holder_id, card_id, sku, name, status, description, category, sub_category, item_format, condition, image_url, paid_price, current_price, date_acquired, source)
       VALUES ($1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [userId, cardId, data.sku, data.name, data.status, data.description, data.category, data.subCategory, data.itemFormat, data.condition, data.imageUrl, paidPrice, currentPrice, dateAcquired, source]
    );
    return rows;
  });

  const item = items[0];
  return c.json({ id: item.id, message: 'Item registered' }, 201);
});

// PATCH /api/v1/vault/items/:id
vaultRoutes.patch('/items/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const itemId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const allowedUpdates = ['status', 'paid_price', 'current_price', 'condition', 'image_url', 'description'];
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

  values.push(itemId);
  values.push(userId);

  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE vault_items SET ${updates.join(', ')} WHERE id = $${paramIndex} AND owner_id = $${paramIndex + 1} RETURNING *`,
      values
    );
    return rows;
  });

  const result = items[0];
  if (!result) {
    return c.json({ error: 'Item not found or not owned by user' }, 404);
  }

  return c.json({ id: result.id, message: 'Item updated' });
});

// DELETE /api/v1/vault/items/:id
vaultRoutes.delete('/items/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const itemId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const items = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'DELETE FROM vault_items WHERE id = $1 AND owner_id = $2 RETURNING id',
      [itemId, userId]
    );
    return rows;
  });

  if (!items.length) {
    return c.json({ error: 'Item not found or not owned by user' }, 404);
  }

  return c.json({ message: 'Item deleted' });
});

// POST /api/v1/vault/items/:id/redemptions
vaultRoutes.post('/items/:id/redemptions', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const itemId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { shippingAddress } = body;

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: itemRows } = await client.query(
      'SELECT * FROM vault_items WHERE id = $1 AND owner_id = $2',
      [itemId, userId]
    );
    if (!itemRows.length) {
      throw new Error('Item not found or not owned by user');
    }

    const { rows } = await client.query(
      `INSERT INTO redemptions (item_id, user_id, shipping_address, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`,
      [itemId, userId, shippingAddress ? JSON.stringify(shippingAddress) : null]
    );

    await client.query("UPDATE vault_items SET status = 'REDEEMING' WHERE id = $1", [itemId]);

    return rows[0];
  });

  return c.json({
    redemptionId: result.id,
    itemId: result.item_id,
    userId: result.user_id,
    status: result.status,
    shippingAddress: result.shipping_address,
    createdAt: result.created_at,
  }, 201);
});

// POST /api/v1/vault/items/:id/vault-deliveries
vaultRoutes.post('/items/:id/vault-deliveries', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const itemId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { shippingAddress } = body;

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: itemRows } = await client.query(
      'SELECT * FROM vault_items WHERE id = $1 AND owner_id = $2',
      [itemId, userId]
    );
    if (!itemRows.length) {
      throw new Error('Item not found or not owned by user');
    }

    const { rows } = await client.query(
      `INSERT INTO vault_deliveries (item_id, user_id, shipping_address, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`,
      [itemId, userId, shippingAddress ? JSON.stringify(shippingAddress) : null]
    );

    await client.query("UPDATE vault_items SET status = 'IN_TRANSIT' WHERE id = $1", [itemId]);

    return rows[0];
  });

  return c.json({
    deliveryId: result.id,
    itemId: result.item_id,
    userId: result.user_id,
    status: result.status,
    shippingAddress: result.shipping_address,
    createdAt: result.created_at,
  }, 201);
});

// POST /api/v1/vault/items/:id/consign
vaultRoutes.post('/items/:id/consign', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const itemId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows: itemRows } = await client.query(
      'SELECT * FROM vault_items WHERE id = $1 AND owner_id = $2',
      [itemId, userId]
    );
    if (!itemRows.length) {
      throw new Error('Item not found or not owned by user');
    }

    const { rows } = await client.query(
      "UPDATE vault_items SET status = 'VAULT_HELD' WHERE id = $1 AND owner_id = $2 RETURNING *",
      [itemId, userId]
    );

    return rows[0];
  });

  return c.json({
    itemId: result.id,
    status: result.status,
    message: 'Item consigned to platform vault',
  });
});
