-- 004_store_tables.sql
-- Store groups (storefront organization) + store reviews
-- Run per tenant schema (same as previous migrations)

CREATE TABLE IF NOT EXISTS store_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  card_codes JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_groups_user ON store_groups(user_id);

CREATE TABLE IF NOT EXISTS store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- One review per reviewer per store
  UNIQUE (store_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_store_reviews_store ON store_reviews(store_id);
