import { Hono } from 'hono';
import { z } from 'zod';
import { hash, verify } from '../../scripts/hash';
import { createToken, optionalAuth } from '../middleware/auth';
import { withTenant } from '../db';
import type { Env } from '../db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const authRoutes = new Hono<{ Bindings: Env }>();
authRoutes.use('*', optionalAuth);

// POST /api/v1/auth/login
authRoutes.post('/auth/login', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'SELECT id, email, password_hash, name, tier, kyc_status, avatar_url, currency FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  });

  if (!result) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await verify(password, result.password_hash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createToken(result.id, result.email, result.tier, c.env.JWT_SECRET);

  return c.json({
    token,
    user: {
      id: result.id,
      email: result.email,
      name: result.name,
      tier: result.tier,
      kycStatus: result.kyc_status,
      avatarUrl: result.avatar_url,
      currency: result.currency,
    },
  });
});

// POST /api/v1/auth/register
authRoutes.post('/auth/register', async (c) => {
  const tenantId = c.get('tenantId');
  const body = await c.req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const { email, password, name } = parsed.data;
  const passwordHash = await hash(password);

  try {
    const result = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (email, password_hash, name, tier, kyc_status, currency)
         VALUES ($1, $2, $3, 'REGULAR', 'NONE', 'THB')
         RETURNING id, email, name, tier, kyc_status, avatar_url, currency`,
        [email, passwordHash, name]
      );
      return rows[0];
    });

    const token = await createToken(result.id, result.email, result.tier, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        tier: result.tier,
        kycStatus: result.kyc_status,
        avatarUrl: result.avatar_url,
        currency: result.currency,
      },
    }, 201);
  } catch (err: any) {
    if (err.code === '23505') {
      return c.json({ error: 'Email already exists' }, 409);
    }
    console.error('Register error:', err);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// PATCH /api/v1/auth/preferences — persist user settings (auth required)
authRoutes.patch('/auth/preferences', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const updates: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (typeof body.currency === 'string' && body.currency.length <= 8) {
    updates.push(`currency = $${paramIndex}`);
    values.push(body.currency);
    paramIndex++;
  }
  if (body.notifications && typeof body.notifications === 'object') {
    const n = body.notifications;
    updates.push(`notifications = $${paramIndex}::jsonb`);
    values.push(JSON.stringify({
      push: !!n.push,
      email: !!n.email,
      line: !!n.line,
      sms: !!n.sms,
    }));
    paramIndex++;
  }
  if (typeof body.preferredGrader === 'string' || body.preferredGrader === null) {
    updates.push(`preferred_grader = $${paramIndex}`);
    values.push(body.preferredGrader);
    paramIndex++;
  }
  if (typeof body.preferredPreGrader === 'string' || body.preferredPreGrader === null) {
    updates.push(`preferred_pre_grader = $${paramIndex}`);
    values.push(body.preferredPreGrader);
    paramIndex++;
  }

  if (values.length === 0) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }

  values.push(userId);

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, name, tier, kyc_status, avatar_url, currency, preferred_grader, preferred_pre_grader, notifications, created_at, updated_at`,
      values as (string | number)[]
    );
    return rows[0];
  });

  return c.json({
    id: result.id,
    email: result.email,
    name: result.name,
    tier: result.tier,
    kycStatus: result.kyc_status,
    avatarUrl: result.avatar_url,
    currency: result.currency,
    preferredGrader: result.preferred_grader,
    preferredPreGrader: result.preferred_pre_grader,
    notifications: result.notifications,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  });
});

// POST /api/v1/auth/change-password (auth required)
authRoutes.post('/auth/change-password', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const parsed = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
  }).safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    return rows[0] || null;
  });
  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }

  const valid = await verify(parsed.data.currentPassword, result.password_hash);
  if (!valid) {
    return c.json({ error: 'Current password is incorrect' }, 401);
  }

  const newHash = await hash(parsed.data.newPassword);
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, userId]);
  });

  return c.json({ status: 'password_changed' });
});

// DELETE /api/v1/auth/account — permanently delete the account (password confirm)
authRoutes.delete('/auth/account', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const password = typeof body.password === 'string' ? body.password : '';

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    return rows[0] || null;
  });
  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }

  const valid = await verify(password, result.password_hash);
  if (!valid) {
    return c.json({ error: 'Password is incorrect' }, 401);
  }

  // All owned data cascades (vault items, listings, orders, offers, wishlist, follows, ...)
  await withTenant(c.env, tenantId, async (client) => {
    await client.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  return c.json({ status: 'account_deleted' });
});

// GET /api/v1/auth/user
authRoutes.get('/auth/user', async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const result = await withTenant(c.env, tenantId, async (client) => {
    const { rows } = await client.query(
      'SELECT id, email, name, tier, kyc_status, avatar_url, currency, preferred_grader, preferred_pre_grader, notifications, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    return rows[0] || null;
  });

  if (!result) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({
    id: result.id,
    email: result.email,
    name: result.name,
    tier: result.tier,
    kycStatus: result.kyc_status,
    avatarUrl: result.avatar_url,
    currency: result.currency,
    preferredGrader: result.preferred_grader,
    preferredPreGrader: result.preferred_pre_grader,
    notifications: result.notifications,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  });
});
