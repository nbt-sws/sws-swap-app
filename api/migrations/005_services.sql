-- 005_services.sql
-- Store-provided grading services: providers, packages, service orders
-- Run per tenant schema (same as previous migrations)

CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,                    -- PREGRADE | GRADE
  service_types JSONB DEFAULT '[]',
  accepted_graders JSONB DEFAULT '[]',
  description TEXT DEFAULT '',
  delivery_mode TEXT DEFAULT 'PHYSICAL_SHIP',-- PHYSICAL_SHIP | PHYSICAL_DROP_OFF | PHOTO_UPLOAD
  turnaround TEXT DEFAULT '',
  price_per_card INT DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  contact_line TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_providers_user ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category ON service_providers(category);

CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  grader TEXT,                               -- PSA | BGS | CGC | TAG | null (pregrade)
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  delivery_mode TEXT DEFAULT 'PHYSICAL_SHIP',
  turnaround TEXT DEFAULT '',
  price_per_card INT NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  includes JSONB DEFAULT '[]',
  enabled BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_packages_provider ON service_packages(provider_id);

CREATE TABLE IF NOT EXISTS service_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  category TEXT NOT NULL,                    -- PREGRADE | GRADE
  grader TEXT,
  card_ids JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'PENDING',    -- PENDING | IN_PROGRESS | COMPLETED | CANCELLED
  stages JSONB NOT NULL DEFAULT '[]',        -- [{key,label,completed,timestamp}]
  total_amount INT NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  delivery_mode TEXT DEFAULT 'PHYSICAL_SHIP',
  shipping_address JSONB,
  tracking_no TEXT,
  grade_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_orders_user ON service_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_provider ON service_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
