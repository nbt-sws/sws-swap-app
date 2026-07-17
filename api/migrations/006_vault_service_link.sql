-- 006_vault_service_link.sql
-- Link vault items to their active service order (for grade-status badges)
-- Run per tenant schema (same as previous migrations)

ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS service_order_id UUID;

CREATE INDEX IF NOT EXISTS idx_vault_items_service_order ON vault_items(service_order_id);
