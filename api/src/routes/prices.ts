import { Hono } from 'hono';
import { withTenant } from '../db';
import type { Env } from '../db';
import { optionalAuth } from '../middleware/auth';

export const priceRoutes = new Hono<{ Bindings: Env }>();
priceRoutes.use('*', optionalAuth);

/* eslint-disable @typescript-eslint/no-explicit-any */

const EBAY_TOKEN_URL = 'https://api.ebay.com/identity/v1/oauth2/token';
const EBAY_SEARCH_URL = 'https://api.ebay.com/buy/browse/v1/item_summary/search';
const TCG_CATEGORY = '183454';

// Token cache lives for the lifetime of the worker isolate (tokens last ~2h)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getEbayToken(env: Env): Promise<string | null> {
  if (cachedToken && Date.now() + 60_000 < cachedToken.expiresAt) {
    return cachedToken.token;
  }
  if (!env.EBAY_APP_ID || !env.EBAY_CERT_ID) return null;

  const resp = await fetch(EBAY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${env.EBAY_APP_ID}:${env.EBAY_CERT_ID}`)}`,
    },
    body: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope'),
  });
  if (!resp.ok) return null;
  const json: any = await resp.json();
  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 7200) * 1000,
  };
  return cachedToken.token;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 100) / 100;
}

async function fetchUsdToThb(): Promise<number> {
  try {
    const resp = await fetch('https://api.frankfurter.app/latest?from=USD&to=THB');
    const json: any = await resp.json();
    return json.rates?.THB ?? 35;
  } catch {
    return 35;
  }
}

// GET /api/v1/prices?code=&name=&lang=
// Market prices per marketplace: our own SWS market + eBay (adapted from sws-scanner-service)
priceRoutes.get('/prices', async (c) => {
  const tenantId = c.get('tenantId');
  const code = (c.req.query('code') ?? '').trim();
  const name = (c.req.query('name') ?? '').trim();
  if (!code && !name) {
    return c.json({ error: 'code or name required' }, 400);
  }

  // ─── Our own market (SWS) ───
  const sws = await withTenant(c.env, tenantId, async (client) => {
    if (!code) return { count: 0, floor: null as number | null, listings: [] as any[] };
    const { rows } = await client.query(
      `SELECT l.listing_id, l.price, l.condition, l.title
       FROM listings l
       LEFT JOIN vault_items v ON l.item_id = v.id
       WHERE l.status = 'ACTIVE' AND (UPPER(v.sku) = UPPER($1) OR UPPER(l.title) ILIKE '%' || UPPER($1) || '%')
       ORDER BY l.price ASC
       LIMIT 10`,
      [code]
    );
    return {
      count: rows.length,
      floor: rows[0]?.price ?? null,
      listings: rows.map((r: any) => ({ listingId: r.listing_id, price: r.price, condition: r.condition, title: r.title })),
    };
  });

  // ─── eBay ───
  let ebay: any = { count: 0, currency: 'USD', items: [] };
  const token = await getEbayToken(c.env);
  if (token) {
    const q = [code, name].filter(Boolean).join(' ').slice(0, 100);
    try {
      const resp = await fetch(
        `${EBAY_SEARCH_URL}?q=${encodeURIComponent(q)}&category_ids=${TCG_CATEGORY}&limit=20`,
        { headers: { Authorization: `Bearer ${token}`, 'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US' } }
      );
      if (resp.ok) {
        const json: any = await resp.json();
        const summaries: any[] = json.itemSummaries ?? [];
        const prices = summaries
          .map((it) => parseFloat(it.price?.value ?? '0'))
          .filter((p) => p > 0);
        const fx = await fetchUsdToThb();
        ebay = {
          count: prices.length,
          currency: 'USD',
          median: median(prices),
          min: prices.length ? Math.min(...prices) : 0,
          max: prices.length ? Math.max(...prices) : 0,
          thb: prices.length
            ? {
                median: Math.round(median(prices) * fx),
                min: Math.round(Math.min(...prices) * fx),
                max: Math.round(Math.max(...prices) * fx),
                rate: fx,
              }
            : null,
          items: summaries.slice(0, 4).map((it) => ({
            title: it.title,
            price: parseFloat(it.price?.value ?? '0'),
            url: it.itemWebUrl,
            thumbnail: it.thumbnailImages?.[0]?.imageUrl,
          })),
        };
      }
    } catch {
      // eBay failure is non-fatal — SWS data still returned
    }
  }

  return c.json({ ok: true, query: { code, name }, sws, ebay });
});

// GET /api/v1/cards/variants?code= — catalog rows sharing a code (parallel/rarity variants)
priceRoutes.get('/cards/variants', async (c) => {
  const code = (c.req.query('code') ?? '').trim();
  if (!code) return c.json({ error: 'code required' }, 400);

  const variants = await withTenant(c.env, (c.get('tenantId')), async (client) => {
    const { rows } = await client.query(
      `SELECT code, name_en, name_jp, rarity, type, language, game, image_url, condition
       FROM public.cards WHERE UPPER(code) = UPPER($1) LIMIT 20`,
      [code]
    );
    return rows.map((r: any) => ({
      code: r.code,
      nameEn: r.name_en,
      nameJp: r.name_jp,
      rarity: r.rarity,
      type: r.type,
      language: r.language,
      game: r.game,
      imageUrl: r.image_url,
      condition: r.condition,
    }));
  });

  return c.json({ ok: true, variants });
});
