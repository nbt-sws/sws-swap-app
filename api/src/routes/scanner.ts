import { Hono } from 'hono';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

export const scannerRoutes = new Hono<{ Bindings: Env }>();
scannerRoutes.use('*', authMiddleware);

/* eslint-disable @typescript-eslint/no-explicit-any */

const HEALTH_TIMEOUT_MS = 3_000;
const PROXY_TIMEOUT_MS = 5_000;

/** Scanner base URL without trailing slash, or null when unconfigured. */
function scannerBase(env: Env): string | null {
  const raw = env.SCANNER_SERVICE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/+$/, '');
}

/** Fetch JSON with timeout — null on any failure (network, non-200, bad JSON). */
async function fetchJson(url: string, timeoutMs: number): Promise<any | null> {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

/** Absolutize a (possibly relative) image path against the scanner origin. */
function absolutize(imageUrl: unknown, origin: string): string | undefined {
  if (typeof imageUrl !== 'string' || !imageUrl) return undefined;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

// GET /api/v1/scanner/health — scanner readiness, never errors (spec §A)
scannerRoutes.get('/scanner/health', async (c) => {
  const base = scannerBase(c.env);
  if (!base) {
    return c.json({ ok: true, scanner: { configured: false, ready: false } });
  }
  try {
    const resp = await fetch(`${base}/readyz`, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) });
    return c.json({ ok: true, scanner: { configured: true, ready: resp.ok } });
  } catch {
    return c.json({ ok: true, scanner: { configured: true, ready: false } });
  }
});

// GET /api/v1/scanner/op-details?code= — verified card details from scanner (spec §A)
scannerRoutes.get('/scanner/op-details', async (c) => {
  const code = (c.req.query('code') ?? '').trim();
  if (!code) return c.json({ error: 'code required' }, 400);

  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, details: null });

  const json = await fetchJson(`${base}/v1/op-details?code=${encodeURIComponent(code)}`, PROXY_TIMEOUT_MS);
  if (!json) return c.json({ ok: true, configured: true, details: null });

  const d: any = json?.details ?? json;
  const details = {
    officialImageUrl: d?.officialImageUrl,
    officialName: d?.officialName,
    officialSetName: d?.officialSetName,
    officialReleaseDate: d?.officialReleaseDate,
    sampleImageUrl: d?.sampleImageUrl,
    watermarkedSampleUrl: d?.watermarkedSampleUrl,
  };
  const hasAny = Object.values(details).some((v) => typeof v === 'string' && v.length > 0);
  return c.json({ ok: true, configured: true, details: hasAny ? details : null });
});

// GET /api/v1/scanner/op-variants?code= — One Piece variants (image precedence handled by scanner)
scannerRoutes.get('/scanner/op-variants', async (c) => {
  const code = (c.req.query('code') ?? '').trim();
  if (!code) return c.json({ error: 'code required' }, 400);

  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, variants: [] });

  const json = await fetchJson(`${base}/v1/op-variants?code=${encodeURIComponent(code)}`, PROXY_TIMEOUT_MS);
  const arr: any[] = Array.isArray(json?.variants) ? json.variants : [];
  const variants = arr.map((v: any) => ({
    code: String(v?.code ?? v?.variantCode ?? ''),
    name: String(v?.name ?? v?.variantName ?? ''),
    rarity: String(v?.rarity ?? ''),
    imageUrl: typeof v?.imageUrl === 'string' ? v.imageUrl : null,
    source: 'scanner' as const,
  }));
  return c.json({ ok: true, configured: true, variants });
});

// GET /api/v1/scanner/sample-catalogs — DON!! + CN-anniv official sample grids (spec §A)
scannerRoutes.get('/scanner/sample-catalogs', async (c) => {
  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, catalogs: [] });

  const [don, cn] = await Promise.all([
    fetchJson(`${base}/v1/don-cards`, PROXY_TIMEOUT_MS),
    fetchJson(`${base}/v1/cn-anniv-cards`, PROXY_TIMEOUT_MS),
  ]);

  const catalogs: any[] = [];
  const donItems = normalizeItems(don?.items, base);
  if (donItems) {
    catalogs.push({ id: 'don', title: 'DON!! Official Samples', count: don?.count ?? donItems.length, items: donItems });
  }
  const cnItems = normalizeItems(cn?.items, base);
  if (cnItems) {
    catalogs.push({ id: 'cn-anniv', title: 'CN 1st Anniversary Samples', count: cn?.count ?? cnItems.length, items: cnItems });
  }

  return c.json({ ok: true, configured: true, catalogs });
});

/** Normalize DON / CN-anniv item shapes (SCANNER_SERVICE.md §4.1) into the contract item shape. */
function normalizeItems(items: unknown, origin: string): any[] | null {
  if (!Array.isArray(items)) return null;
  return items.map((it: any) => ({
    id: String(it?.id ?? ''),
    imageUrl: absolutize(it?.imageUrl, origin) ?? '',
    name: typeof it?.name === 'string' && it.name ? it.name : undefined,
    rarity: typeof it?.rarity === 'string' && it.rarity ? it.rarity : undefined,
    variant: typeof it?.variant === 'string' && it.variant ? it.variant : undefined,
    setCode: it?.setCode ?? undefined,
  }));
}

// POST /api/v1/scanner/visual-match — compare user's photo to candidate variant images
scannerRoutes.post('/scanner/visual-match', async (c) => {
  const base = scannerBase(c.env);
  if (!base) return c.json({ ok: true, configured: false, result: null });

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid json' }, 400);
  }
  if (!body?.image || !Array.isArray(body?.candidates) || body.candidates.length === 0) {
    return c.json({ error: 'image and candidates required' }, 400);
  }

  let json: any;
  try {
    const resp = await fetch(`${base}/v1/visual-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });
    if (!resp.ok) return c.json({ ok: true, configured: true, result: null });
    json = await resp.json();
  } catch {
    return c.json({ ok: true, configured: true, result: null });
  }
  if (!json) return c.json({ ok: true, configured: true, result: null });

  const normalizeCandidate = (cand: any) => ({
    id: String(cand?.id ?? ''),
    imageUrl: typeof cand?.imageUrl === 'string' ? cand.imageUrl : undefined,
    matchScore: typeof cand?.matchScore === 'number' ? cand.matchScore : 0,
    matched: !!cand?.matched,
  });

  const result = {
    ok: !!json.ok,
    degraded: !!json.degraded,
    mode: String(json.mode ?? ''),
    confident: !!json.confident,
    bestMatchUrl: typeof json.bestMatchUrl === 'string' ? json.bestMatchUrl : undefined,
    candidates: Array.isArray(json.candidates) ? json.candidates.map(normalizeCandidate) : undefined,
    bestMatch: json.bestMatch ? normalizeCandidate(json.bestMatch) : undefined,
    haikuConfirmation: json.haikuConfirmation
      ? {
          matchId: String(json.haikuConfirmation.matchId ?? ''),
          confidence: typeof json.haikuConfirmation.confidence === 'number' ? json.haikuConfirmation.confidence : 0,
        }
      : undefined,
    labels: Array.isArray(json.labels) ? json.labels : undefined,
    webEntities: Array.isArray(json.webEntities) ? json.webEntities : undefined,
    counts: json.counts ?? undefined,
    reason: typeof json.reason === 'string' ? json.reason : undefined,
  };

  return c.json({ ok: true, configured: true, result });
});
