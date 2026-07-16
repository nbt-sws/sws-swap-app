import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

const offerSchema = z.object({
  listingId: z.string().uuid(),
  offerPrice: z.number().int().min(0),
});

export const offerRoutes = new Hono<{ Bindings: Env }>();
offerRoutes.use('*', authMiddleware);

// GET /api/v1/offers
offerRoutes.get('/', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const direction = c.req.query('direction');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const offers = await withTenant(c.env, tenantId, async (client) => {
    let sql = `
      SELECT o.*, 
             l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
             l.image_url as listing_image_url, l.seller_id as listing_seller_id,
             b.name as buyer_name, s.name as seller_name
      FROM offers o
      LEFT JOIN listings l ON o.listing_id = l.listing_id
      LEFT JOIN users b ON o.buyer_id = b.id
      LEFT JOIN users s ON o.seller_id = s.id
      WHERE 1=1
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (direction === 'INCOMING') {
      sql += ` AND o.seller_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else if (direction === 'OUTGOING') {
      sql += ` AND o.buyer_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    } else {
      sql += ` AND (o.buyer_id = $${paramIndex} OR o.seller_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }

    sql += ` ORDER BY o.created_at DESC`;

    const { rows } = await client.query(sql, params);
    return rows;
  });

  return c.json({
    offers: offers.map((o: any) => ({
      id: o.id,
      listingId: o.listing_id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      offerPrice: o.offer_price,
      status: o.status,
      expiresAt: o.expires_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        sellerId: o.listing_seller_id,
      } : null,
      fromUser: o.buyer_id === userId ? { id: o.buyer_id, name: o.buyer_name } : { id: o.seller_id, name: o.seller_name },
      toUser: o.buyer_id === userId ? { id: o.seller_id, name: o.seller_name } : { id: o.buyer_id, name: o.buyer_name },
    })),
  });
});

// POST /api/v1/offers
offerRoutes.post('/', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const parsed = offerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;

  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: listingRows } = await client.query(
      'SELECT * FROM listings WHERE listing_id = $1 AND status = $2',
      [data.listingId, 'ACTIVE']
    );
    const listing = listingRows[0];

    if (!listing) {
      throw new Error('Listing not found or not active');
    }

    if (listing.seller_id === userId) {
      throw new Error('Cannot make offer on your own listing');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { rows } = await client.query(
      `INSERT INTO offers (listing_id, buyer_id, seller_id, offer_price, status, expires_at)
       VALUES ($1, $2, $3, $4, 'PENDING', $5)
       RETURNING *`,
      [data.listingId, userId, listing.seller_id, data.offerPrice, expiresAt.toISOString()]
    );
    return rows;
  });

  const offer = offers[0];
  return c.json({
    id: offer.id,
    listingId: offer.listing_id,
    buyerId: offer.buyer_id,
    sellerId: offer.seller_id,
    offerPrice: offer.offer_price,
    status: offer.status,
    expiresAt: offer.expires_at,
    createdAt: offer.created_at,
  }, 201);
});

// PATCH /api/v1/offers/:id
offerRoutes.patch('/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const offerId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { status } = body;

  if (!status || !['ACCEPTED', 'DECLINED', 'COUNTERED'].includes(status)) {
    return c.json({ error: 'Invalid status. Must be ACCEPTED, DECLINED, or COUNTERED' }, 400);
  }

  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      'SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3',
      [offerId, userId, 'PENDING']
    );
    const current = currentRows[0];

    if (!current) {
      throw new Error('Offer not found or not authorized');
    }

    if (new Date(current.expires_at) < new Date()) {
      await client.query("UPDATE offers SET status = 'DECLINED' WHERE id = $1", [offerId]);
      throw new Error('Offer has expired');
    }

    const updates: string[] = ['status = $1'];
    const values: (string | number)[] = [status];
    let paramIndex = 2;

    if (status === 'COUNTERED' && body.offerPrice) {
      updates.push(`offer_price = $${paramIndex}`);
      values.push(body.offerPrice);
      paramIndex++;
    }

    values.push(offerId);

    const { rows } = await client.query(
      `UPDATE offers SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return rows;
  });

  const offer = offers[0];

  if (status === 'ACCEPTED') {
    await withTenant(c.env, tenantId, async (client) => {
      await client.query(
        'UPDATE listings SET price = $1, status = $2 WHERE listing_id = $3',
        [offer.offer_price, 'INACTIVE', offer.listing_id]
      );
    });
  }

  return c.json({
    id: offer.id,
    status: offer.status,
    offerPrice: offer.offer_price,
    updatedAt: offer.updated_at,
  });
});

// GET /api/v1/offers/received
offerRoutes.get('/received', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT o.*, 
              l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
              l.image_url as listing_image_url, l.seller_id as listing_seller_id,
              b.name as buyer_name, s.name as seller_name
       FROM offers o
       LEFT JOIN listings l ON o.listing_id = l.listing_id
       LEFT JOIN users b ON o.buyer_id = b.id
       LEFT JOIN users s ON o.seller_id = s.id
       WHERE o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  });

  return c.json({
    offers: offers.map((o: any) => ({
      id: o.id,
      listingId: o.listing_id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      offerPrice: o.offer_price,
      status: o.status,
      expiresAt: o.expires_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      buyerName: o.buyer_name ?? undefined,
      sellerName: o.seller_name ?? undefined,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        sellerId: o.listing_seller_id,
      } : null,
    })),
  });
});

// GET /api/v1/offers/sent
offerRoutes.get('/sent', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `SELECT o.*, 
              l.title as listing_title, l.price as listing_price, l.currency as listing_currency,
              l.image_url as listing_image_url, l.seller_id as listing_seller_id,
              b.name as buyer_name, s.name as seller_name
       FROM offers o
       LEFT JOIN listings l ON o.listing_id = l.listing_id
       LEFT JOIN users b ON o.buyer_id = b.id
       LEFT JOIN users s ON o.seller_id = s.id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  });

  return c.json({
    offers: offers.map((o: any) => ({
      id: o.id,
      listingId: o.listing_id,
      buyerId: o.buyer_id,
      sellerId: o.seller_id,
      offerPrice: o.offer_price,
      status: o.status,
      expiresAt: o.expires_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      buyerName: o.buyer_name ?? undefined,
      sellerName: o.seller_name ?? undefined,
      listing: o.listing_title ? {
        listingId: o.listing_id,
        title: o.listing_title,
        price: o.listing_price,
        currency: o.listing_currency,
        imageUrl: o.listing_image_url,
        sellerId: o.listing_seller_id,
      } : null,
    })),
  });
});

// POST /api/v1/offers/:id/accept
offerRoutes.post('/:id/accept', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const offerId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      'SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3',
      [offerId, userId, 'PENDING']
    );
    const current = currentRows[0];

    if (!current) {
      throw new Error('Offer not found or not authorized');
    }

    if (new Date(current.expires_at) < new Date()) {
      await client.query("UPDATE offers SET status = 'DECLINED' WHERE id = $1", [offerId]);
      throw new Error('Offer has expired');
    }

    const { rows } = await client.query(
      "UPDATE offers SET status = 'ACCEPTED' WHERE id = $1 RETURNING *",
      [offerId]
    );

    await client.query(
      'UPDATE listings SET price = $1, status = $2 WHERE listing_id = $3',
      [current.offer_price, 'INACTIVE', current.listing_id]
    );

    return rows;
  });

  const offer = offers[0];
  return c.json({
    id: offer.id,
    status: offer.status,
    offerPrice: offer.offer_price,
    updatedAt: offer.updated_at,
  });
});

// POST /api/v1/offers/:id/decline
offerRoutes.post('/:id/decline', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const offerId = c.req.param('id');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const offers = await withTenant(c.env, tenantId, async (client) => {
    const { rows: currentRows } = await client.query(
      'SELECT * FROM offers WHERE id = $1 AND seller_id = $2 AND status = $3',
      [offerId, userId, 'PENDING']
    );
    const current = currentRows[0];

    if (!current) {
      throw new Error('Offer not found or not authorized');
    }

    const { rows } = await client.query(
      "UPDATE offers SET status = 'DECLINED' WHERE id = $1 RETURNING *",
      [offerId]
    );
    return rows;
  });

  const offer = offers[0];
  return c.json({
    id: offer.id,
    status: offer.status,
    updatedAt: offer.updated_at,
  });
});
