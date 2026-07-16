import { Client } from '@neondatabase/serverless';
import { hash } from './hash';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const TENANT_ID = process.env.TENANT_ID || 'default';
const SCHEMA_NAME = `tenant_${TENANT_ID}`;

const USER1_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const USER2_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const V1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
const V2 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
const V3 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
const V4 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4';
const V5 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5';
const M1 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
const M2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2';
const M3 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3';

async function seed() {
  const client = new Client(DATABASE_URL);
  await client.connect();
  await client.query(`SET search_path = ${SCHEMA_NAME}, public`);

  try {
    // Seed users
    const passwordHash = await hash('password123');
    await client.query(`
      INSERT INTO users (id, email, password_hash, name, tier, kyc_status, currency)
      VALUES 
        ($1, 'boboboa@example.com', $3, 'BoBoBoA', 'MEMBER', 'APPROVED', 'THB'),
        ($2, 'regular@example.com', $3, 'Regular User', 'REGULAR', 'NONE', 'THB')
      ON CONFLICT (email) DO NOTHING
    `, [USER1_ID, USER2_ID, passwordHash]);
    console.log('✓ Users seeded');

    // Seed vault items for BoBoBoA
    await client.query(`
      INSERT INTO vault_items (id, owner_id, holder_id, card_id, sku, name, status, paid_price, current_price, currency, date_acquired, source, condition)
      VALUES 
        ($1, $6, $6, (SELECT id FROM public.cards WHERE code = 'OP02-013'), 'OP02-013', 'Portgas D. Ace', 'AVAILABLE', 12500, 18440, 'THB', '2026-03-12', 'Yahoo! JP auction', 'Raw'),
        ($2, $6, $6, (SELECT id FROM public.cards WHERE code = 'QCAC-JP001'), 'QCAC-JP001', 'Blue-Eyes White Dragon', 'VAULT_HELD', 8800, 9850, 'THB', '2026-01-20', 'Local shop', 'Raw'),
        ($3, $6, $6, (SELECT id FROM public.cards WHERE code = 'OP01-025'), 'OP01-025', 'Nami (Alt Art)', 'AVAILABLE', 5200, 4120, 'THB', '2025-11-05', 'Trade', 'Raw'),
        ($4, $6, $6, (SELECT id FROM public.cards WHERE code = 'OP01-001'), 'OP01-001', 'Roronoa Zoro', 'AVAILABLE', 4500, 6900, 'THB', '2026-02-14', 'eBay', 'PSA 10'),
        ($5, $6, $6, (SELECT id FROM public.cards WHERE code = 'OP05-060'), 'OP05-060', 'Monkey D. Luffy G5', 'LOCKED', 28000, 32000, 'THB', '2026-04-01', 'SwibSwap Market', 'RAWLITY 9')
      ON CONFLICT (id) DO NOTHING
    `, [V1, V2, V3, V4, V5, USER1_ID]);
    console.log('✓ Vault items seeded');

    // Seed listings
    await client.query(`
      INSERT INTO listings (listing_id, item_id, seller_id, title, price, currency, status, category, item_format, condition, seller_display_name, seller_tier, owner_id, holder_id, views, watchers, is_featured)
      VALUES 
        ('${M1}', '${V5}', '${USER1_ID}', 'Monkey D. Luffy G5', 32000, 'THB', 'ACTIVE', 'PRE-GRADED', 'SALE', 'RAWLITY 9', 'kaido99', 'MEMBER', '${USER1_ID}', '${USER1_ID}', 128, 4, TRUE),
        ('${M2}', NULL, '${USER2_ID}', 'Winged Kuriboh', 8400, 'THB', 'ACTIVE', 'RAW', 'TRADE', 'Raw', 'duelist_bkk', 'REGULAR', '${USER2_ID}', '${USER2_ID}', 67, 2, FALSE),
        ('${M3}', NULL, '${USER2_ID}', 'Charlotte Katakuri', 5900, 'THB', 'ACTIVE', 'GRADED', 'SALE', 'PSA 10', 'nami_swan', 'MEMBER', '${USER2_ID}', '${USER2_ID}', 215, 8, TRUE)
      ON CONFLICT (listing_id) DO NOTHING
    `);
    console.log('✓ Listings seeded');

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
