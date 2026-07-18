-- 007_scans.sql
-- Scan cache: exact-image cache for card identification results
-- Run per tenant schema (same as previous migrations)

CREATE TABLE IF NOT EXISTS scans (
  hash TEXT PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  card JSONB NOT NULL,
  image_url TEXT,
  identified_by TEXT NOT NULL,
  cache_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scans_user ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at);
