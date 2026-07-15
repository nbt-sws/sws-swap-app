-- 001_initial.sql
-- Schema for Vault + Market + Orders + Offers (core trading flow)
-- Run per tenant schema + public schema for shared cards catalog

-- Shared: Cards catalog (explicitly in public schema)
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_jp TEXT,
  rarity TEXT,
  type TEXT,
  language TEXT,
  game TEXT,
  image_url TEXT,
  condition TEXT DEFAULT 'Raw',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant-scoped tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  tier TEXT DEFAULT 'REGULAR',
  kyc_status TEXT DEFAULT 'NONE',
  avatar_url TEXT,
  currency TEXT DEFAULT 'THB',
  preferred_grader TEXT,
  preferred_pre_grader TEXT,
  notifications JSONB DEFAULT '{"push":false,"email":false,"line":false,"sms":false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  holder_id UUID REFERENCES users(id) ON DELETE SET NULL,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE',
  description TEXT,
  category TEXT,
  sub_category TEXT,
  item_format TEXT,
  condition TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  paid_price INTEGER DEFAULT 0,
  current_price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  date_acquired DATE,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vault_items_owner ON vault_items(owner_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_status ON vault_items(status);
CREATE INDEX IF NOT EXISTS idx_vault_items_holder ON vault_items(holder_id);

CREATE TABLE IF NOT EXISTS listings (
  listing_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES vault_items(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'THB',
  status TEXT DEFAULT 'ACTIVE',
  category TEXT,
  sub_category TEXT,
  item_format TEXT,
  condition TEXT,
  image_url TEXT,
  seller_display_name TEXT,
  seller_avatar_url TEXT,
  seller_bio TEXT,
  seller_tier TEXT,
  owner_id UUID REFERENCES users(id),
  holder_id UUID REFERENCES users(id),
  views INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = TRUE;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(listing_id) ON DELETE SET NULL,
  item_id UUID REFERENCES vault_items(id) ON DELETE SET NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'CREATED',
  delivery_preference TEXT DEFAULT 'SHIP',
  shipping_address JSONB,
  locked_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(listing_id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_price INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  price INTEGER NOT NULL,
  period TEXT,
  traded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_sku ON price_history(sku);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vault_items_updated_at') THEN
    CREATE TRIGGER update_vault_items_updated_at BEFORE UPDATE ON vault_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_listings_updated_at') THEN
    CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_orders_updated_at') THEN
    CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_offers_updated_at') THEN
    CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
