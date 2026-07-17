import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant, notify } from '../db';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

const orderSchema = z.object({
  listingId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  price: z.number().int().min(0),
  deliveryPreference: z.enum(['SHIP', 'VAULT_STORE']).default('SHIP'),
  shippingAddress: z.object({
    name: z.string(),
    address: z.string(),
    province: z.string(),
    postalCode: z.string(),
    phone: z.string(),
    district: z.string().optional(),
  }).optional(),
});

export const orderRoutes = new Hono<{ Bindings: Env }>();
orderRoutes.use('*', authMiddleware);

// GET /api/v1/orders
orderRoutes.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const role = c.req.query('role');
  const status = c.req.query('status');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const orders = await withTenant(c.env, tenantId, async (client) => {
    let sql = `
      SELECT o.*, 
             l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
             l.image_url as listing_image_url, l.condition as listing_condition,
             l.seller_display_name, l.seller_id as listing_seller_id,
             c.code as card_code, c.name_en as card_name_en,
             v.name as item_name, v.image_url as item_image_url, v.sku as item_sku
      FROM orders o
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN vault_items v ON o.item_id = v.id
      LEFT JOIN cards c ON v.card_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (role === 'buyer') {
      sql += ` AND o.buyer_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (role === 'seller') {
      sql += ` AND o.seller_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else {
      sql += ` AND (o.buyer_id = $${paramIndex} OR o.seller_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY o.created_at DESC`;

    const { rows } = await client.query(sql, params);
    return rows;
  });

  return c.json({
    orders: orders.map((o: any) => ({
      id: o.id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      listingId: o.listing_id,
      itemId: o.item_id,
      price: o.price,
      status: o.status,
      deliveryPreference: o.delivery_preference,
      shippingAddress: o.shipping_address,
      lockedAt: o.locked_at,
      paidAt: o.paid_at,
      completedAt: o.completed_at,
      cancelledAt: o.cancelled_at,
      cancelReason: o.cancel_reason,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      cardCode: o.card_code ?? undefined,
      cardNameEn: o.card_name_en ?? undefined,
      itemName: o.item_name ?? undefined,
      itemImageUrl: o.item_image_url ?? undefined,
      itemSku: o.item_sku ?? undefined,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        condition: o.listing_condition,
        sellerDisplayName: o.seller_display_name,
        sellerId: o.listing_seller_id,
      } : null,
    })),
  });
});

// GET /api/v1/orders/:id
orderRoutes.get('/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const orderId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT o.*, 
              l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
              l.image_url as listing_image_url, l.condition as listing_condition,
              l.seller_display_name, l.seller_id as listing_seller_id,
              c.code as card_code, c.name_en as card_name_en,
              v.name as item_name, v.image_url as item_image_url, v.sku as item_sku
       FROM orders o
       LEFT JOIN listings l ON o.listing_id = l.listing_id
       LEFT JOIN vault_items v ON o.item_id = v.id
       LEFT JOIN cards c ON v.card_id = c.id
       WHERE o.id = $1 AND (o.buyer_id = $2 OR o.seller_id = $2)`,
      [orderId, userId]
    );
    return rows;
  });

  const order = orders[0];
  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json({
    id: order.id,
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    listingId: order.listing_id,
    itemId: order.item_id,
    price: order.price,
    status: order.status,
    deliveryPreference: order.delivery_preference,
    shippingAddress: order.shipping_address,
    lockedAt: order.locked_at,
    paidAt: order.paid_at,
    completedAt: order.completed_at,
    cancelledAt: order.cancelled_at,
    cancelReason: order.cancel_reason,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    cardCode: order.card_code ?? undefined,
    cardNameEn: order.card_name_en ?? undefined,
    itemName: order.item_name ?? undefined,
    itemImageUrl: order.item_image_url ?? undefined,
    itemSku: order.item_sku ?? undefined,
    listing: order.listing_title ? {
      listingId: order.listing_id,
      title: order.listing_title,
      price: order.listing_price,
      currency: order.listing_currency,
      imageUrl: order.listing_image_url,
      condition: order.listing_condition,
      sellerDisplayName: order.seller_display_name,
      sellerId: order.listing_seller_id,
    } : null,
  });
});

// POST /api/v1/orders
orderRoutes.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;

  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows: listingRows } = await client.query(
      'SELECT * FROM listings WHERE listing_id = $1 AND status = $2',
      [data.listingId, 'ACTIVE']
    );
    const listing = listingRows[0];

    if (!listing) {
      throw new Error('Listing not found or not active');
    }

    if (listing.seller_id === userId) {
      throw new Error('Cannot buy your own listing');
    }

    if (listing.item_id) {
      await client.query("UPDATE vault_items SET status = 'LOCKED' WHERE id = $1", [listing.item_id]);
    }

    await client.query("UPDATE listings SET status = 'INACTIVE' WHERE listing_id = $1", [data.listingId]);

    const { rows } = await client.query(
      `INSERT INTO orders (buyer_id, seller_id, listing_id, item_id, price, status, delivery_preference, shipping_address, locked_at)
       VALUES ($1, $2, $3, $4, $5, 'CREATED', $6, $7, NOW())
       RETURNING *`,
      [userId, listing.seller_id, data.listingId, listing.item_id || data.itemId, data.price, data.deliveryPreference, data.shippingAddress ? JSON.stringify(data.shippingAddress) : null]
    );

    await notify(
      client,
      listing.seller_id,
      'New order',
      `"${listing.title}" sold for ฿${data.price.toLocaleString()}`,
      'ORDER_CREATED'
    );

    return rows;
  });

  const order = orders[0];
  return c.json({
    id: order.id,
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    listingId: order.listing_id,
    itemId: order.item_id,
    price: order.price,
    status: order.status,
    deliveryPreference: order.delivery_preference,
    createdAt: order.created_at,
  }, 201);
});

// PATCH /api/v1/orders/:id
orderRoutes.patch('/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const orderId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { status } = body;

  if (!status) {
    return c.json({ error: 'Status is required' }, 400);
  }

  const validTransitions: Record<string, string[]> = {
    'CREATED': ['PAYMENT_PENDING', 'CANCELLED'],
    'PAYMENT_PENDING': ['PAYMENT_CONFIRMED', 'CANCELLED'],
    'PAYMENT_CONFIRMED': ['SHIPPING_ARRANGED', 'CANCELLED'],
    'SHIPPING_ARRANGED': ['COMPLETED', 'CANCELLED'],
  };

  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [orderId, userId]
    );
    const current = currentRows[0];

    if (!current) {
      throw new Error('Order not found');
    }

    const allowed = validTransitions[current.status] || [];
    if (!allowed.includes(status)) {
      throw new Error(`Invalid status transition from ${current.status} to ${status}`);
    }

    const updates: string[] = ['status = $1'];
    const values: (string | null)[] = [status];
    let paramIndex = 2;

    if (status === 'PAYMENT_CONFIRMED') {
      updates.push(`paid_at = NOW()`);
    }
    if (status === 'SHIPPING_ARRANGED') {
      updates.push(`paid_at = COALESCE(paid_at, NOW())`);
    }
    if (status === 'COMPLETED') {
      updates.push(`completed_at = NOW()`);
      if (current.item_id) {
        await client.query(
          'UPDATE vault_items SET owner_id = $1, holder_id = $1, status = $2 WHERE id = $3',
          [current.buyer_id, 'AVAILABLE', current.item_id]
        );
      }
      // Record the trade for market price history (sku from the vault item)
      if (current.item_id) {
        const { rows: itemRows } = await client.query('SELECT sku FROM vault_items WHERE id = $1', [current.item_id]);
        if (itemRows[0]?.sku) {
          await client.query(
            'INSERT INTO price_history (sku, price, traded_at) VALUES ($1, $2, NOW())',
            [itemRows[0].sku, current.price]
          );
        }
      }
    }
    if (status === 'CANCELLED') {
      updates.push(`cancelled_at = NOW()`);
      if (body.cancelReason) {
        updates.push(`cancel_reason = $${paramIndex}`);
        values.push(body.cancelReason);
        paramIndex++;
      }
      if (current.item_id) {
        await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [current.item_id]);
      }
      await client.query("UPDATE listings SET status = 'ACTIVE' WHERE listing_id = $1", [current.listing_id]);
    }

    values.push(orderId);

    const { rows } = await client.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    // Notify the buyer about the status change (skip plain cancels by seller, covered below)
    const statusLabels: Record<string, string> = {
      PAYMENT_PENDING: 'pending payment',
      PAYMENT_CONFIRMED: 'payment confirmed',
      SHIPPING_ARRANGED: 'shipping arranged',
      COMPLETED: 'completed — the card is now in your vault',
      CANCELLED: 'cancelled',
    };
    await notify(
      client,
      current.buyer_id,
      'Order update',
      `Order ${orderId.slice(0, 8)}… is now ${statusLabels[status] ?? status.toLowerCase()}`,
      status === 'COMPLETED' ? 'ORDER_COMPLETED' : 'ORDER_STATUS'
    );

    return rows;
  });

  const order = orders[0];
  return c.json({
    id: order.id,
    status: order.status,
    paidAt: order.paid_at,
    completedAt: order.completed_at,
    cancelledAt: order.cancelled_at,
    cancelReason: order.cancel_reason,
    updatedAt: order.updated_at,
  });
});

// POST /api/v1/orders/:id/cancel
orderRoutes.post('/:id/cancel', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const orderId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const { reason } = body;

  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [orderId, userId]
    );
    const current = currentRows[0];

    if (!current) {
      throw new Error('Order not found');
    }

    const allowed = ['CREATED', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'SHIPPING_ARRANGED'];
    if (!allowed.includes(current.status)) {
      throw new Error(`Cannot cancel order in status ${current.status}`);
    }

    const updates = ['status = $1', 'cancelled_at = NOW()'];
    const values: (string | null)[] = ['CANCELLED'];
    let paramIndex = 2;

    if (reason) {
      updates.push(`cancel_reason = $${paramIndex}`);
      values.push(reason);
      paramIndex++;
    }

    values.push(orderId);

    const { rows } = await client.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (current.item_id) {
      await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = $1", [current.item_id]);
    }
    await client.query("UPDATE listings SET status = 'ACTIVE' WHERE listing_id = $1", [current.listing_id]);

    return rows;
  });

  const order = orders[0];
  return c.json({
    orderId: order.id,
    status: order.status,
    cancelledAt: order.cancelled_at,
    cancelReason: order.cancel_reason,
  });
});
