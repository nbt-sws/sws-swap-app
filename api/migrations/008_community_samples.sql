-- 008_community_samples.sql
-- Community-contributed card sample images — shared catalog enrichment across tenants.
-- When the catalog (public.cards) has no image for a code, a contributed sample fills
-- the gap for future scans (image options / candidate thumbnails).
-- Pre-launch: contributions are auto-approved. Add a moderation queue before public launch.

CREATE TABLE IF NOT EXISTS community_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT 'one-piece',
  lang TEXT NOT NULL DEFAULT 'JP',
  rarity TEXT NOT NULL DEFAULT '',
  name_en TEXT,
  image_url TEXT NOT NULL,
  contributed_by UUID,
  status TEXT NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (code, lang, rarity)
);

CREATE INDEX IF NOT EXISTS idx_community_samples_code ON community_samples (UPPER(code));
