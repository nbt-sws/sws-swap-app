import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

export const catalogRoutes = new Hono<{ Bindings: Env }>();
catalogRoutes.use('*', authMiddleware);

/* eslint-disable @typescript-eslint/no-explicit-any */

const MAX_PAGE_SIZE = 60;

const cardsQuerySchema = z.object({
  game: z.string().trim().max(50).optional(),
  q: z.string().trim().max(100).optional(),
  rarity: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(24),
});

function mapCard(r: any) {
  return {
    code: r.code,
    nameEn: r.name_en,
    nameJp: r.name_jp,
    rarity: r.rarity,
    type: r.type,
    game: r.game,
    imageUrl: r.image_url,
  };
}

// GET /api/v1/catalog/games — game list with card counts (spec §A)
catalogRoutes.get('/catalog/games', async (c) => {
  const games = await withTenant(c.env, c.get('tenantId'), async (client) => {
    const { rows } = await client.query(
      `SELECT game, COUNT(*)::int AS count FROM public.cards GROUP BY game ORDER BY count DESC, game ASC`
    );
    return rows.map((r: any) => ({ game: r.game, count: r.count }));
  });
  return c.json({ ok: true, games });
});

// GET /api/v1/catalog/cards?game=&q=&rarity=&page=1&pageSize=24 — paginated catalog search (spec §A)
catalogRoutes.get('/catalog/cards', async (c) => {
  const parsed = cardsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: 'Invalid query', details: parsed.error.flatten() }, 400);
  }
  const { game, q, rarity, page } = parsed.data;
  const pageSize = Math.min(parsed.data.pageSize, MAX_PAGE_SIZE);

  const conditions: string[] = [];
  const params: string[] = [];
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(code ILIKE $${params.length} OR name_en ILIKE $${params.length})`);
  }
  if (game) {
    params.push(game);
    conditions.push(`game ILIKE $${params.length}`);
  }
  if (rarity) {
    params.push(rarity);
    conditions.push(`rarity ILIKE $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await withTenant(c.env, c.get('tenantId'), async (client) => {
    const { rows: countRows } = await client.query(
      `SELECT COUNT(*)::int AS total FROM public.cards ${where}`,
      params
    );
    const total: number = countRows[0]?.total ?? 0;
    const { rows } = await client.query(
      `SELECT code, name_en, name_jp, rarity, type, game, image_url
       FROM public.cards ${where}
       ORDER BY code ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, (page - 1) * pageSize]
    );
    return { total, cards: rows.map(mapCard) };
  });

  return c.json({ ok: true, total: result.total, page, pageSize, cards: result.cards });
});

// GET /api/v1/catalog/cards/:code — card detail + related rows (same logic as /cards/variants)
catalogRoutes.get('/catalog/cards/:code', async (c) => {
  const code = (c.req.param('code') ?? '').trim();
  if (!code) return c.json({ error: 'code required' }, 400);

  const rows = await withTenant(c.env, c.get('tenantId'), async (client) => {
    const { rows } = await client.query(
      `SELECT code, name_en, name_jp, rarity, type, game, image_url
       FROM public.cards WHERE UPPER(code) = UPPER($1)
       ORDER BY rarity ASC, language ASC
       LIMIT 20`,
      [code]
    );
    return rows;
  });

  const card = rows.length ? mapCard(rows[0]) : null;
  const variants = rows.map((r: any) => ({
    code: r.code,
    nameEn: r.name_en,
    rarity: r.rarity,
    type: r.type,
    imageUrl: r.image_url,
  }));
  return c.json({ ok: true, card, variants });
});
