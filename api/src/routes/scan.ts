import { Hono } from 'hono';
import { z } from 'zod';
import { withTenant } from '../db';
import type { Env } from '../db';
import { authMiddleware } from '../middleware/auth';

export const scanRoutes = new Hono<{ Bindings: Env }>();

// Bump when identification logic changes so old cached results are ignored
const CACHE_VERSION = 'v5-centering';
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const VISION_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_IMAGE_B64 = 7 * 1024 * 1024;

// Trusted catalog hosts for the Vision web cross-check (same idea as the Go service)
const TRUSTED_HOSTS = [
  'cardpiece', 'optcgapi', 'apitcg', 'bandai', 'takaratomy',
  'pokemon.com', 'pokemontcg.io', 'yugioh-card.com', 'konami',
  'pricecharting', 'tcgplayer', 'cardmarket', 'ebay',
];

/* eslint-disable @typescript-eslint/no-explicit-any */

const TCG_META: Record<string, { game: string; prompt: string; codeRegex: RegExp; ocrRegex: RegExp }> = {
  'one-piece': {
    game: 'One Piece TCG',
    prompt: `You are a One Piece TCG card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Card code formats: OPXX-XXX, STXX-XXX, EBXX-XXX, PRB-XX, or P-XXX for promos.
Rarities: C, UC, R, SR, SEC, L, TR, SP, MR, P, DON!!.
Types: Leader, Character, Event, Stage, DON!!.
Detect parallel/star rarity if the rarity symbol has a star above it. If unsure between similar cards, put alternatives in candidates with lower confidence.`,
    codeRegex: /^(OP|ST|EB)\d{2}-\d{3}$|^PRB-\d{2}$|^P-\d{3}$/i,
    ocrRegex: /\b((?:OP|ST|EB)\d{2}-\d{3}|PRB-\d{2}|P-\d{3})\b/i,
  },
  'yu-gi-oh': {
    game: 'Yu-Gi-Oh! OCG',
    prompt: `You are a Yu-Gi-Oh! OCG card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Card code format: SETCODE-LANG### (e.g., LEDE-JP001, MAMA-EN001).
Rarities: N, R, SR, UR, UL, SE, HR, PSE, 20TH, QCSE, QCUR, CR, PGR, C.
Frame colors map to types: yellow Normal, orange Effect, green Spell, pink Trap, blue Ritual, purple Fusion, white Synchro, black Xyz, half-color Pendulum, dark blue Link.`,
    codeRegex: /^[A-Z0-9]{3,5}-[A-Z]{2}\d{3}$/i,
    ocrRegex: /\b([A-Z0-9]{3,5}-[A-Z]{2}\d{3})\b/i,
  },
  pokemon: {
    game: 'Pokémon TCG',
    prompt: `You are a Pokémon TCG card identifier. Output valid JSON only with these fields: code (set-number/total like 025/198 or promo code), nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Rarities: C, U, R, RR, SR, UR, HR, AR, SAR, ACE, PR.`,
    codeRegex: /^\d{1,3}\/\d{1,3}$|^[A-Z]{2,}\d{1,3}$|^S-P\d+$|^SM-P\d+$/i,
    ocrRegex: /\b(\d{1,3}\/\d{1,3}|S-P\d+|SM-P\d+)\b/i,
  },
  lorcana: {
    game: 'Disney Lorcana TCG',
    prompt: `You are a Disney Lorcana card identifier. Output valid JSON only with these fields: code (e.g., 1/204, P1, or set format), nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).
Rarities: Common, Uncommon, Rare, Super Rare, Legendary, Enchanted.
Types: Character, Action, Item, Location, Song.`,
    codeRegex: /^\d{1,3}\/\d{1,3}$|^P\d+$/i,
    ocrRegex: /\b(\d{1,3}\/\d{1,3})\b/i,
  },
  conan: {
    game: 'Detective Conan TCG',
    prompt: `You are a Detective Conan TCG card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence).`,
    codeRegex: /^[A-Z0-9-]{3,}$/i,
    ocrRegex: /\b([A-Z0-9]{3,}-\d+)\b/i,
  },
  others: {
    game: 'trading card',
    prompt: `You are a trading card identifier. Output valid JSON only with these fields: code, nameEn, nameJp, rarity, type, promo (boolean), confidence (0-100), reasoning, centering (object {"left","right","top","bottom"}: your visual estimate of border thickness distribution as percentages where left+right=100 and top+bottom=100, 50/50 = perfectly centered), and candidates (array of your top 3 guesses, best first, each with code, nameEn, rarity, confidence). Identify the game if recognizable and include it in reasoning.`,
    codeRegex: /.+/,
    ocrRegex: /\b([A-Z]{2,5}-?\d{2,4})\b/i,
  },
};

const scanSchema = z.object({
  image: z.string().min(100),
  tcg: z.string().default('one-piece'),
  lang: z.string().default('JP'),
  force: z.boolean().optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────

function extractJson(text: string): any {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON in model response');
  return JSON.parse(text.slice(start, end + 1));
}

async function identifyWithHaiku(apiKey: string, imageB64: string, mediaType: string, prompt: string): Promise<any> {
  const resp = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageB64 } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  });
  const json: any = await resp.json();
  if (json.error) throw new Error(`anthropic: ${json.error.message}`);
  const text = json.content?.[0]?.text;
  if (!text) throw new Error('empty model response');
  return extractJson(text);
}

async function visionAnnotate(apiKey: string, imageB64: string): Promise<any | null> {
  try {
    const resp = await fetch(`${VISION_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageB64 },
          features: [
            { type: 'WEB_DETECTION', maxResults: 50 },
            { type: 'DOCUMENT_TEXT_DETECTION' },
          ],
        }],
      }),
    });
    const json: any = await resp.json();
    return json.responses?.[0] ?? null;
  } catch {
    return null; // Vision is an enhancer, not a requirement — degrade gracefully
  }
}

/** OCR-first: pull the card code straight out of Vision's document text. */
function extractCodeFromVision(vision: any, ocrRegex: RegExp): string | null {
  const text: string = vision?.fullTextAnnotation?.text ?? '';
  const m = text.match(ocrRegex);
  return m ? m[1].toUpperCase() : null;
}

/** Cross-check: find a code on trusted catalog pages from web detection. */
function extractCodeFromWeb(vision: any, ocrRegex: RegExp): string | null {
  const web = vision?.webDetection;
  const candidates: string[] = [
    ...(web?.pagesWithMatchingImages ?? []).map((p: any) => p.url ?? ''),
    ...(web?.bestGuessLabels ?? []).map((l: any) => l.label ?? ''),
  ];
  for (const raw of candidates) {
    if (!raw) continue;
    const lower = raw.toLowerCase();
    if (!TRUSTED_HOSTS.some((h) => lower.includes(h))) continue;
    const m = raw.match(ocrRegex);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── POST /api/v1/scan — full pipeline adapted from sws-scanner-service ───
scanRoutes.post('/scan', authMiddleware, async (c) => {
  const tenantId = c.get('tenantId');
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }
  const { image, tcg, lang, force } = parsed.data;

  const meta = TCG_META[tcg] ?? TCG_META['one-piece'];
  const match = image.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  const mediaType = match?.[1] ?? 'image/jpeg';
  const imageB64 = match?.[2] ?? image;
  if (imageB64.length > MAX_IMAGE_B64) {
    return c.json({ error: 'Image too large (max ~5MB)' }, 400);
  }

  const hash = await sha256Hex(imageB64);

  // 1) Exact-image cache
  if (!force) {
    const cached = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query('SELECT card, image_url, identified_by FROM scans WHERE hash = $1 AND cache_version = $2', [hash, CACHE_VERSION]);
      return rows[0];
    });
    if (cached) {
      const stored: any = cached.card ?? {};
      const { _extras, ...cardOnly } = stored;
      return c.json({
        ok: true, cached: true, card: cardOnly, hash, imageUrl: cached.image_url, identifiedBy: cached.identified_by,
        catalog: _extras?.catalog ?? null,
        nearMatches: _extras?.nearMatches ?? [],
        candidates: _extras?.candidates ?? [],
        imageOptions: _extras?.imageOptions ?? [{ url: cached.image_url, label: 'your-photo' }],
      });
    }
  }

  if (!c.env.ANTHROPIC_API_KEY) {
    return c.json({ error: 'Scan service not configured (ANTHROPIC_API_KEY missing)' }, 503);
  }

  // 2) Parallel AI: Claude Haiku (identity JSON) + Google Vision (OCR + web detection)
  const [haikuRes, visionRes] = await Promise.allSettled([
    identifyWithHaiku(c.env.ANTHROPIC_API_KEY, imageB64, mediaType, meta.prompt),
    c.env.GOOGLE_VISION_API_KEY ? visionAnnotate(c.env.GOOGLE_VISION_API_KEY, imageB64) : Promise.resolve(null),
  ]);

  if (haikuRes.status === 'rejected') {
    return c.json({ ok: false, error: 'Identification failed', message: haikuRes.reason?.message }, 502);
  }
  const card: any = haikuRes.value;
  const vision = visionRes.status === 'fulfilled' ? visionRes.value : null;

  card.code = String(card.code ?? '').replace(/\s+/g, '').toUpperCase();
  let confidence = Math.max(0, Math.min(100, Number(card.confidence) || 0));

  // 3) OCR-first override — Vision's raw text wins when it contains a valid code
  const ocrCode = vision ? extractCodeFromVision(vision, meta.ocrRegex) : null;
  let identifiedBy = 'haiku';
  if (ocrCode && meta.codeRegex.test(ocrCode)) {
    card.code = ocrCode;
    confidence = Math.max(confidence, 92);
    identifiedBy = 'ocr-extract';
  }

  // 4) Cross-check — Haiku and Vision web detection agree → highest trust
  const visionWebCode = vision ? extractCodeFromWeb(vision, meta.ocrRegex) : null;
  const codeValid = meta.codeRegex.test(card.code);
  const crossCheck: any = { agreed: false, haikuCode: card.code || null, visionCode: visionWebCode };
  if (codeValid && visionWebCode && card.code === visionWebCode) {
    crossCheck.agreed = true;
    crossCheck.adopted = card.code;
    confidence = Math.max(confidence, 95);
    identifiedBy = 'vision-cross-check';
  } else if (codeValid && confidence >= 90) {
    identifiedBy = identifiedBy === 'ocr-extract' ? identifiedBy : 'haiku-confident';
  }

  // 5) Trust gate (same order as the Go service: ocr > cross-check > haiku>=90 > haiku-with-code)
  if (!codeValid && confidence < 90) {
    return c.json({ ok: false, error: 'unable to identify card', card, hash, crossCheck }, 422);
  }

  // 6) Catalog enrichment — exact match + near matches (alternatives when the ID is wrong)
  let catalog: any = null;
  let nearMatches: any[] = [];
  if (codeValid || card.nameEn) {
    const enriched = await withTenant(c.env, tenantId, async (client) => {
      let exact: any = null;
      if (codeValid) {
        const { rows } = await client.query(
          'SELECT code, name_en, name_jp, rarity, type, language, game, image_url, condition FROM public.cards WHERE UPPER(code) = $1 LIMIT 1',
          [card.code]
        );
        const r = rows[0];
        if (r) exact = { code: r.code, nameEn: r.name_en, nameJp: r.name_jp, rarity: r.rarity, type: r.type, language: r.language, game: r.game, imageUrl: r.image_url, condition: r.condition };
      }
      // Near matches: same name (different set/parallel) or same code prefix (different variant)
      const terms: string[] = [];
      const params: string[] = [];
      if (card.nameEn && String(card.nameEn).length >= 3) {
        params.push(`%${String(card.nameEn).trim()}%`);
        terms.push(`name_en ILIKE $${params.length}`);
      }
      const prefix = String(card.code ?? '').match(/^([A-Z]{2,})/i)?.[1];
      if (prefix && prefix.length >= 2) {
        params.push(`${prefix.toUpperCase()}%`);
        terms.push(`UPPER(code) LIKE $${params.length}`);
      }
      let near: any[] = [];
      if (terms.length) {
        const { rows } = await client.query(
          `SELECT code, name_en, name_jp, rarity, type, game, image_url FROM public.cards WHERE (${terms.join(' OR ')}) AND UPPER(code) <> $${params.length + 1} LIMIT 6`,
          [...params, String(card.code ?? '').toUpperCase()]
        );
        near = rows.map((r: any) => ({ code: r.code, nameEn: r.name_en, nameJp: r.name_jp, rarity: r.rarity, type: r.type, game: r.game, imageUrl: r.image_url, source: 'catalog' }));
      }
      return { exact, near };
    });
    catalog = enriched.exact;
    nearMatches = enriched.near;
  }

  // 7) AI candidates — Haiku's top-3 guesses, deduped, enriched with catalog data when possible
  const seenCodes = new Set<string>([String(card.code ?? '').toUpperCase(), ...nearMatches.map((m) => String(m.code).toUpperCase())]);
  const candidates: any[] = [];
  for (const cand of Array.isArray(card.candidates) ? card.candidates : []) {
    if (candidates.length >= 3) break;
    const code = String(cand?.code ?? '').replace(/\s+/g, '').toUpperCase();
    if (!code || seenCodes.has(code)) continue;
    seenCodes.add(code);
    candidates.push({
      code,
      nameEn: String(cand?.nameEn ?? ''),
      rarity: String(cand?.rarity ?? ''),
      confidence: Math.max(0, Math.min(100, Number(cand?.confidence) || 0)),
      source: 'ai',
    });
  }
  if (candidates.length) {
    const codes = candidates.map((cd) => cd.code);
    const catalogRows = await withTenant(c.env, tenantId, async (client) => {
      const { rows } = await client.query(
        'SELECT code, name_en, name_jp, rarity, type, game, image_url FROM public.cards WHERE UPPER(code) = ANY($1)',
        [codes]
      );
      return rows;
    });
    for (const cd of candidates) {
      const r = catalogRows.find((row: any) => String(row.code).toUpperCase() === cd.code);
      if (r) {
        cd.nameEn = cd.nameEn || r.name_en;
        cd.nameJp = r.name_jp;
        cd.rarity = cd.rarity || r.rarity;
        cd.type = r.type;
        cd.game = r.game;
        cd.imageUrl = r.image_url;
      }
    }
  }

  // 7) Persist: image to R2 + cache row
  const origin = new URL(c.req.url).origin;
  const imageKey = `scans/${tenantId}/${hash}.jpg`;
  await c.env.IMAGES.put(imageKey, Uint8Array.from(atob(imageB64), (ch) => ch.charCodeAt(0)), {
    httpMetadata: { contentType: mediaType },
  });
  const imageUrl = `${origin}/api/v1/images/${imageKey}`;

  const cardOut = {
    code: card.code,
    nameEn: card.nameEn ?? '',
    nameJp: card.nameJp ?? '',
    rarity: card.rarity ?? '',
    type: card.type ?? '',
    promo: !!card.promo,
    confidence,
    lang,
    reasoning: card.reasoning ?? '',
    // AI-estimated border distribution (centering) — honest label on the UI side
    centering: (() => {
      const ct = card.centering;
      if (!ct || typeof ct !== 'object') return null;
      const nums = [ct.left, ct.right, ct.top, ct.bottom].map((n: any) => Number(n));
      if (nums.some((n) => !Number.isFinite(n) || n <= 0 || n >= 100)) return null;
      return { left: nums[0], right: nums[1], top: nums[2], bottom: nums[3] };
    })(),
  };

  // 8) Image options — user's photo first, then official/catalog sample images to pick as cover
  const imageOptions: { url: string; label: string }[] = [{ url: imageUrl, label: 'your-photo' }];
  const seenImages = new Set<string>([imageUrl]);
  for (const src of [catalog, ...nearMatches, ...candidates]) {
    const u = src?.imageUrl;
    if (u && !seenImages.has(u) && imageOptions.length < 6) {
      seenImages.add(u);
      imageOptions.push({ url: u, label: src?.code ?? 'catalog' });
    }
  }

  await withTenant(c.env, tenantId, async (client) => {
    await client.query(
      `INSERT INTO scans (hash, user_id, card, image_url, identified_by, cache_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (hash) DO NOTHING`,
      [hash, userId, JSON.stringify({ ...cardOut, _extras: { catalog, nearMatches, candidates, imageOptions } }), imageUrl, identifiedBy, CACHE_VERSION]
    );
  });

  return c.json({ ok: true, cached: false, card: cardOut, hash, imageUrl, identifiedBy, crossCheck, catalog, nearMatches, candidates, imageOptions });
});
