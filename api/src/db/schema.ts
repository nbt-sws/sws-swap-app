import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, foreignKey, pgSchema } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Shared: Cards catalog (in public schema)
export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  code: text('code').notNull().unique(),
  nameEn: text('name_en').notNull(),
  nameJp: text('name_jp'),
  rarity: text('rarity'),
  type: text('type'),
  language: text('language'),
  game: text('game'),
  imageUrl: text('image_url'),
  condition: text('condition').default('Raw'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Tenant-scoped tables will be created in a schema function
export function createTenantSchema(schemaName: string) {
  const tenant = pgSchema(schemaName);

  const users = tenant.table('users', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    tier: text('tier').default('REGULAR'),
    kycStatus: text('kyc_status').default('NONE'),
    avatarUrl: text('avatar_url'),
    currency: text('currency').default('THB'),
    preferredGrader: text('preferred_grader'),
    preferredPreGrader: text('preferred_pre_grader'),
    notifications: jsonb('notifications').default(sql`'{"push":false,"email":false,"line":false,"sms":false}'`),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  });

  const vaultItems = tenant.table('vault_items', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }),
    holderId: uuid('holder_id').references(() => users.id, { onDelete: 'set null' }),
    cardId: uuid('card_id').references(() => cards.id, { onDelete: 'set null' }),
    sku: text('sku').notNull(),
    name: text('name').notNull(),
    status: text('status').default('AVAILABLE'),
    description: text('description'),
    category: text('category'),
    subCategory: text('sub_category'),
    itemFormat: text('item_format'),
    condition: text('condition'),
    imageUrl: text('image_url'),
    metadata: jsonb('metadata').default(sql`'{}'`),
    paidPrice: integer('paid_price').default(0),
    currentPrice: integer('current_price').default(0),
    currency: text('currency').default('THB'),
    dateAcquired: timestamp('date_acquired', { withTimezone: true }),
    source: text('source'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  });

  const listings = tenant.table('listings', {
    listingId: uuid('listing_id').primaryKey().default(sql`gen_random_uuid()`),
    itemId: uuid('item_id').references(() => vaultItems.id, { onDelete: 'cascade' }),
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    currency: text('currency').default('THB'),
    status: text('status').default('ACTIVE'),
    category: text('category'),
    subCategory: text('sub_category'),
    itemFormat: text('item_format'),
    condition: text('condition'),
    imageUrl: text('image_url'),
    sellerDisplayName: text('seller_display_name'),
    sellerAvatarUrl: text('seller_avatar_url'),
    sellerBio: text('seller_bio'),
    sellerTier: text('seller_tier'),
    ownerId: uuid('owner_id').references(() => users.id),
    holderId: uuid('holder_id').references(() => users.id),
    views: integer('views').default(0),
    watchers: integer('watchers').default(0),
    isFeatured: boolean('is_featured').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  });

  const orders = tenant.table('orders', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }),
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }),
    listingId: uuid('listing_id').references(() => listings.listingId, { onDelete: 'set null' }),
    itemId: uuid('item_id').references(() => vaultItems.id, { onDelete: 'set null' }),
    price: integer('price').notNull(),
    status: text('status').default('CREATED'),
    deliveryPreference: text('delivery_preference').default('SHIP'),
    shippingAddress: jsonb('shipping_address'),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancelReason: text('cancel_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  });

  const offers = tenant.table('offers', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    listingId: uuid('listing_id').references(() => listings.listingId, { onDelete: 'cascade' }),
    buyerId: uuid('buyer_id').references(() => users.id, { onDelete: 'cascade' }),
    sellerId: uuid('seller_id').references(() => users.id, { onDelete: 'cascade' }),
    offerPrice: integer('offer_price').notNull(),
    status: text('status').default('PENDING'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  });

  const priceHistory = tenant.table('price_history', {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    sku: text('sku').notNull(),
    price: integer('price').notNull(),
    period: text('period'),
    tradedAt: timestamp('traded_at', { withTimezone: true }).defaultNow(),
  });

  return { users, vaultItems, listings, orders, offers, priceHistory };
}

export type InsertUser = typeof cards.$inferInsert;
export type SelectUser = typeof cards.$inferSelect;
