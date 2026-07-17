import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware, optionalAuth } from '../middleware/auth';

export const serviceRoutes = new Hono<{ Bindings: Env }>();
serviceRoutes.use('*', optionalAuth);

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Stage templates (single source of truth) ────────────────────────

const STAGE_TEMPLATES: Record<string, { key: string; label: string }[]> = {
  PREGRADE: [
    { key: 'ordered', label: 'Ordered' },
    { key: 'received', label: 'Materials received' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
  ],
  GRADE: [
    { key: 'ordered', label: 'Ordered' },
    { key: 'shipped-to-store', label: 'Shipped to store' },
    { key: 'received-by-store', label: 'Received by store' },
    { key: 'sent-to-grader', label: 'Sent to grader' },
    { key: 'at-grader', label: 'At grader / grading' },
    { key: 'qa', label: 'QA / grading complete' },
    { key: 'returned-to-store', label: 'Returned to store' },
    { key: 'shipped-to-customer', label: 'Shipped to customer' },
    { key: 'delivered', label: 'Delivered' },
  ],
};

function buildStages(category: string) {
  const template = STAGE_TEMPLATES[category] ?? STAGE_TEMPLATES.PREGRADE;
  const now = new Date().toISOString();
  return template.map((s, i) => ({ ...s, completed: i === 0, timestamp: i === 0 ? now : undefined }));
}

// ─── Mappers (DB rows → frontend ServiceProvider/ServicePackage/ServiceOrder shapes) ─

const mapProvider = (r: any) => ({
  id: r.id,
  storeId: r.user_id,
  storeName: r.store_name || `Store ${String(r.user_id).slice(0, 6)}`,
  storeAvatarUrl: r.store_avatar ?? undefined,
  category: r.category,
  serviceTypes: r.service_types ?? [],
  acceptedGraders: r.accepted_graders ?? [],
  description: r.description ?? '',
  deliveryMode: r.delivery_mode,
  turnaround: r.turnaround ?? '',
  pricePerCard: r.price_per_card ?? 0,
  currency: r.currency ?? 'THB',
  scoreLabel: r.category === 'PREGRADE' ? 'Pre-grade score' : 'Grade',
  color: r.category === 'PREGRADE' ? 'periwinkle' : 'cyan',
  enabled: r.enabled,
  contactLine: r.contact_line ?? undefined,
  contactPhone: r.contact_phone ?? undefined,
  contactEmail: r.contact_email ?? undefined,
  createdAt: r.created_at,
});

const mapPackage = (r: any) => ({
  id: r.id,
  providerId: r.provider_id,
  grader: r.grader ?? undefined,
  name: r.name,
  description: r.description ?? '',
  deliveryMode: r.delivery_mode,
  turnaround: r.turnaround ?? '',
  pricePerCard: r.price_per_card ?? 0,
  currency: r.currency ?? 'THB',
  includes: r.includes ?? [],
  enabled: r.enabled,
});

const mapOrder = (r: any) => ({
  id: r.id,
  orderNo: r.order_no,
  userId: r.user_id,
  category: r.category,
  providerId: r.provider_id,
  providerName: r.provider_name || `Store ${String(r.provider_user_id ?? '').slice(0, 6)}`,
  storeId: r.provider_user_id,
  packageId: r.package_id ?? undefined,
  packageName: r.package_name ?? undefined,
  grader: r.grader ?? undefined,
  cardIds: r.card_ids ?? [],
  status: r.status,
  stages: r.stages ?? [],
  totalAmount: r.total_amount ?? 0,
  currency: r.currency ?? 'THB',
  deliveryMode: r.delivery_mode,
  shippingAddress: r.shipping_address ?? undefined,
  trackingNumber: r.tracking_no ?? undefined,
  gradeResult: r.grade_result ?? undefined,
  customerName: r.customer_name ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const PROVIDER_SELECT = `
  SELECT p.*, u.name as store_name, u.avatar_url as store_avatar
  FROM service_providers p
  LEFT JOIN users u ON p.user_id = u.id`;

const ORDER_SELECT = `
  SELECT o.*, p.user_id as provider_user_id, pu.name as provider_name, cu.name as customer_name,
         pkg.name as package_name
  FROM service_orders o
  LEFT JOIN service_providers p ON o.provider_id = p.id
  LEFT JOIN users pu ON p.user_id = pu.id
  LEFT JOIN users cu ON o.user_id = cu.id
  LEFT JOIN service_packages pkg ON o.package_id = pkg.id`;

// ─── Providers (public) ──────────────────────────────────────────────

// GET /api/v1/services/providers?category=
serviceRoutes.get('/services/providers', async (c) => {
  const tenantId = c.get('tenantId');
  const category = c.req.query('category');
  const providers = await withTenant(c.env, tenantId, async (client) => {
    const params: string[] = [];
    let sql = `${PROVIDER_SELECT} WHERE p.enabled = TRUE`;
    if (category) {
      sql += ' AND p.category = $1';
      params.push(category);
    }
    sql += ' ORDER BY p.created_at DESC';
    const { rows } = await client.query(sql, params);
    return rows.map(mapProvider);
  });
  return c.json({ providers });
});

// GET /api/v1/services/providers/me — own provider profile (auth)
serviceRoutes.get('/services/providers/me', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const provider = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${PROVIDER_SELECT} WHERE p.user_id = $1`, [userId]);
    return rows[0] ? mapProvider(rows[0]) : null;
  });
  return c.json({ provider });
});

// GET /api/v1/services/providers/:id — provider + packages (public)
serviceRoutes.get('/services/providers/:id', async (c) => {
  const tenantId = c.get('tenantId');
  const id = c.req.param('id');
  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(`${PROVIDER_SELECT} WHERE p.id = $1`, [id]);
    if (!rows[0]) return null;
    const { rows: packages } = await client.query(
      'SELECT * FROM service_packages WHERE provider_id = $1 AND enabled = TRUE ORDER BY sort_order, price_per_card',
      [id]
    );
    return { provider: mapProvider(rows[0]), packages: packages.map(mapPackage) };
  });
  if (!result) return c.json({ error: 'Provider not found' }, 404);
  return c.json(result);
});

// POST /api/v1/services/providers — become a provider (auth)
const providerSchema = z.object({
  category: z.enum(['PREGRADE', 'GRADE']),
  serviceTypes: z.array(z.string()).optional(),
  acceptedGraders: z.array(z.string()).optional(),
  description: z.string().max(2000).optional(),
  deliveryMode: z.enum(['PHYSICAL_SHIP', 'PHYSICAL_DROP_OFF', 'PHOTO_UPLOAD']).optional(),
  turnaround: z.string().max(120).optional(),
  pricePerCard: z.number().int().min(0).optional(),
  contactLine: z.string().max(120).optional(),
  contactPhone: z.string().max(40).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
});

serviceRoutes.post('/services/providers', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const parsed = providerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;

  try {
    const provider = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        `INSERT INTO service_providers (user_id, category, service_types, accepted_graders, description, delivery_mode, turnaround, price_per_card, contact_line, contact_phone, contact_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          userId, data.category,
          JSON.stringify(data.serviceTypes ?? []), JSON.stringify(data.acceptedGraders ?? []),
          data.description ?? '', data.deliveryMode ?? 'PHYSICAL_SHIP', data.turnaround ?? '',
          data.pricePerCard ?? 0, data.contactLine ?? null, data.contactPhone ?? null, data.contactEmail ?? null,
        ]
      );
      return rows[0];
    });
    return c.json(mapProvider(provider), 201);
  } catch (err: any) {
    if (err.code === '23505') {
      return c.json({ error: 'You already have a provider profile' }, 409);
    }
    throw err;
  }
});

// PUT /api/v1/services/providers/me — update own provider (auth)
serviceRoutes.put('/services/providers/me', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const fieldMap: Record<string, string> = {
    category: 'category',
    description: 'description',
    deliveryMode: 'delivery_mode',
    turnaround: 'turnaround',
    pricePerCard: 'price_per_card',
    contactLine: 'contact_line',
    contactPhone: 'contact_phone',
    contactEmail: 'contact_email',
    enabled: 'enabled',
  };
  const updates: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [field, column] of Object.entries(fieldMap)) {
    if (body[field] !== undefined) {
      updates.push(`${column} = $${paramIndex}`);
      values.push(body[field]);
      paramIndex++;
    }
  }
  if (Array.isArray(body.serviceTypes)) {
    updates.push(`service_types = $${paramIndex}`);
    values.push(JSON.stringify(body.serviceTypes));
    paramIndex++;
  }
  if (Array.isArray(body.acceptedGraders)) {
    updates.push(`accepted_graders = $${paramIndex}`);
    values.push(JSON.stringify(body.acceptedGraders));
    paramIndex++;
  }
  if (values.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }
  values.push(userId);

  const provider = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE service_providers SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values as (string | number | boolean)[]
    );
    return rows[0] ? mapProvider({ ...rows[0], store_name: null, store_avatar: null }) : null;
  });
  if (!provider) return c.json({ error: 'Provider profile not found' }, 404);
  return c.json(provider);
});

// ─── Packages (owner) ────────────────────────────────────────────────

const packageSchema = z.object({
  grader: z.string().max(40).optional(),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  deliveryMode: z.enum(['PHYSICAL_SHIP', 'PHYSICAL_DROP_OFF', 'PHOTO_UPLOAD']).optional(),
  turnaround: z.string().max(120).optional(),
  pricePerCard: z.number().int().min(0),
  includes: z.array(z.string()).optional(),
});

serviceRoutes.post('/services/providers/me/packages', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const parsed = packageSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;

  const pkg = await withTenant(c.env, tenantId, async (client) => {
    const { rows: prov } = await client.query('SELECT id FROM service_providers WHERE user_id = $1', [userId]);
    if (!prov[0]) return null;
    const { rows } = await client.query(
      `INSERT INTO service_packages (provider_id, grader, name, description, delivery_mode, turnaround, price_per_card, includes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [prov[0].id, data.grader ?? null, data.name, data.description ?? '', data.deliveryMode ?? 'PHYSICAL_SHIP', data.turnaround ?? '', data.pricePerCard, JSON.stringify(data.includes ?? [])]
    );
    return rows[0];
  });
  if (!pkg) return c.json({ error: 'Provider profile required first' }, 400);
  return c.json(mapPackage(pkg), 201);
});

// GET own packages incl. disabled (owner)
serviceRoutes.get('/services/providers/me/packages', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const packages = await withTenant(c.env, tenantId, async (client) => {
    const { rows: prov } = await client.query('SELECT id FROM service_providers WHERE user_id = $1', [userId]);
    if (!prov[0]) return [];
    const { rows } = await client.query(
      'SELECT * FROM service_packages WHERE provider_id = $1 ORDER BY sort_order, created_at',
      [prov[0].id]
    );
    return rows.map(mapPackage);
  });
  return c.json({ packages });
});

serviceRoutes.put('/services/packages/:id', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const fieldMap: Record<string, string> = {
    grader: 'grader', name: 'name', description: 'description', deliveryMode: 'delivery_mode',
    turnaround: 'turnaround', pricePerCard: 'price_per_card', enabled: 'enabled',
  };
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;
  for (const [field, column] of Object.entries(fieldMap)) {
    if (body[field] !== undefined) {
      updates.push(`${column} = $${paramIndex}`);
      values.push(body[field]);
      paramIndex++;
    }
  }
  if (Array.isArray(body.includes)) {
    updates.push(`includes = $${paramIndex}`);
    values.push(JSON.stringify(body.includes));
    paramIndex++;
  }
  if (updates.length === 0) return c.json({ error: 'No valid fields to update' }, 400);
  values.push(c.req.param('id'), userId);

  const pkg = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE service_packages SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND provider_id IN (SELECT id FROM service_providers WHERE user_id = $${paramIndex + 1})
       RETURNING *`,
      values as (string | number | boolean)[]
    );
    return rows[0];
  });
  if (!pkg) return c.json({ error: 'Package not found or not owned by user' }, 404);
  return c.json(mapPackage(pkg));
});

// ─── Service orders ──────────────────────────────────────────────────

const orderSchema = z.object({
  providerId: z.string().uuid(),
  packageId: z.string().uuid().optional(),
  cardIds: z.array(z.string().uuid()).min(1).max(50),
  deliveryMode: z.enum(['PHYSICAL_SHIP', 'PHYSICAL_DROP_OFF', 'PHOTO_UPLOAD']).optional(),
  shippingAddress: z.object({
    name: z.string(), phone: z.string(), address: z.string(),
    district: z.string().optional(), province: z.string(), postalCode: z.string(),
  }).optional(),
});

serviceRoutes.post('/service-orders', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }
  const data = parsed.data;

  const result = await withTenant(c.env, tenantId, async (client) => {
    // Provider + package
    const { rows: provRows } = await client.query('SELECT * FROM service_providers WHERE id = $1 AND enabled = TRUE', [data.providerId]);
    const provider = provRows[0];
    if (!provider) return { error: 'Provider not found or not accepting orders' as const };
    if (provider.user_id === userId) return { error: 'Cannot order from your own service' as const };

    let pkg: any = null;
    if (data.packageId) {
      const { rows: pkgRows } = await client.query(
        'SELECT * FROM service_packages WHERE id = $1 AND provider_id = $2 AND enabled = TRUE',
        [data.packageId, data.providerId]
      );
      pkg = pkgRows[0];
      if (!pkg) return { error: 'Package not found' as const };
    }

    // Cards must belong to the buyer and be AVAILABLE
    const { rows: cardRows } = await client.query(
      'SELECT id, status FROM vault_items WHERE id = ANY($1::uuid[]) AND owner_id = $2',
      [data.cardIds, userId]
    );
    if (cardRows.length !== data.cardIds.length) {
      return { error: 'Some cards were not found in your vault' as const };
    }
    const notReady = cardRows.filter((r: any) => r.status !== 'AVAILABLE');
    if (notReady.length > 0) {
      return { error: 'Some cards are not available (listed, locked, or already in a service)' as const };
    }

    const pricePerCard = pkg?.price_per_card ?? provider.price_per_card ?? 0;
    const total = pricePerCard * data.cardIds.length;
    const orderNo = `SWS-${provider.category === 'GRADE' ? 'GR' : 'PG'}-${Math.floor(100000 + Math.random() * 900000)}`;

    const { rows } = await client.query(
      `INSERT INTO service_orders (order_no, user_id, provider_id, package_id, category, grader, card_ids, status, stages, total_amount, delivery_mode, shipping_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9, $10, $11)
       RETURNING *`,
      [
        orderNo, userId, data.providerId, data.packageId ?? null, provider.category,
        pkg?.grader ?? null, JSON.stringify(data.cardIds), JSON.stringify(buildStages(provider.category)),
        total, data.deliveryMode ?? pkg?.delivery_mode ?? provider.delivery_mode,
        data.shippingAddress ? JSON.stringify(data.shippingAddress) : null,
      ]
    );

    // Lock the cards
    await client.query("UPDATE vault_items SET status = 'LOCKED' WHERE id = ANY($1::uuid[])", [data.cardIds]);

    return { row: rows[0] };
  });

  if ('error' in result) return c.json({ error: result.error }, 400);
  return c.json(mapOrder(result.row), 201);
});

// GET /service-orders — my orders as customer
serviceRoutes.get('/service-orders', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows.map(mapOrder);
  });
  return c.json({ orders });
});

// GET /service-orders/received — incoming orders for my provider (owner)
serviceRoutes.get('/service-orders/received', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const orders = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE p.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows.map(mapOrder);
  });
  return c.json({ orders });
});

// GET /service-orders/:id — buyer or provider owner
serviceRoutes.get('/service-orders/:id', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  const id = c.req.param('id');
  const order = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE o.id = $1 AND (o.user_id = $2 OR p.user_id = $2)`,
      [id, userId]
    );
    return rows[0] ? mapOrder(rows[0]) : null;
  });
  if (!order) return c.json({ error: 'Order not found' }, 404);
  return c.json(order);
});

// PATCH /service-orders/:id — owner advances stage / sets result; buyer cancels
serviceRoutes.patch('/service-orders/:id', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const id = c.req.param('id');
  const body = await c.req.json();
  const action = body.action as string;

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `${ORDER_SELECT} WHERE o.id = $1`,
      [id]
    );
    const order = rows[0];
    if (!order) return { error: 'Order not found' as const, status: 404 as const };

    const isOwner = order.provider_user_id === userId;
    const isBuyer = order.user_id === userId;

    // ─── Cancel (buyer, only before work starts) ───
    if (action === 'cancel') {
      if (!isBuyer) return { error: 'Only the customer can cancel' as const, status: 403 as const };
      if (order.status !== 'PENDING') return { error: 'Order can no longer be cancelled' as const, status: 400 as const };
      await client.query("UPDATE service_orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = $1", [id]);
      await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = ANY($1::uuid[])", [order.card_ids]);
      const { rows: updated } = await client.query(`${ORDER_SELECT} WHERE o.id = $1`, [id]);
      return { row: updated[0] };
    }

    // ─── Advance stage (owner) ───
    if (action === 'advance') {
      if (!isOwner) return { error: 'Only the service provider can advance stages' as const, status: 403 as const };
      if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
        return { error: 'Order is already closed' as const, status: 400 as const };
      }

      const stages = Array.isArray(order.stages) ? [...order.stages] : [];
      const nextIdx = stages.findIndex((s: any) => !s.completed);
      if (nextIdx === -1) return { error: 'All stages already completed' as const, status: 400 as const };

      const now = new Date().toISOString();
      stages[nextIdx] = { ...stages[nextIdx], completed: true, timestamp: now };
      const isLast = stages.every((s: any) => s.completed);
      const newStatus = isLast ? 'COMPLETED' : 'IN_PROGRESS';
      const gradeResult = typeof body.gradeResult === 'string' ? body.gradeResult.slice(0, 60) : null;
      const trackingNo = typeof body.trackingNumber === 'string' ? body.trackingNumber.slice(0, 80) : null;

      await client.query(
        `UPDATE service_orders SET stages = $1, status = $2, updated_at = NOW(),
           grade_result = COALESCE($3, grade_result), tracking_no = COALESCE($4, tracking_no)
         WHERE id = $5`,
        [JSON.stringify(stages), newStatus, gradeResult, trackingNo, id]
      );

      if (newStatus === 'IN_PROGRESS' && order.status === 'PENDING') {
        await client.query("UPDATE service_orders SET status = 'IN_PROGRESS' WHERE id = $1", [id]);
      }

      if (isLast) {
        // Return cards to the buyer's vault, stamped with the grade result when provided
        if (gradeResult) {
          await client.query(
            "UPDATE vault_items SET status = 'AVAILABLE', condition = $2 WHERE id = ANY($1::uuid[])",
            [order.card_ids, gradeResult]
          );
        } else {
          await client.query("UPDATE vault_items SET status = 'AVAILABLE' WHERE id = ANY($1::uuid[])", [order.card_ids]);
        }
      }

      const { rows: updated } = await client.query(`${ORDER_SELECT} WHERE o.id = $1`, [id]);
      return { row: updated[0] };
    }

    return { error: 'Unknown action (use advance or cancel)' as const, status: 400 as const };
  });

  if ('error' in result) return c.json({ error: result.error }, result.status ?? 400);
  return c.json(mapOrder(result.row));
});
