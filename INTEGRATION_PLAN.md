# Integration Plan: Merge sws-web-buyer Journey into sws-swap-app UI

## 1. ปัญหาที่พบ (สรุปจากการสำรวจ)

### ปุ่มที่ใช้งานไม่ได้ / ไม่สมบูรณ์
1. **Vault item "List for sale"** → ไป `/seller/new` แต่ไม่ส่ง item context
2. **Vault item "Grade"** → ไป `/pregrade` โดยไม่มี item context  
3. **Vault Bulk List** → ส่งเฉพาะ item แรกไป seller.new
4. **SplashScreen** → ใช้ `useAppStore` (screen-based navigation เก่า) ทำงานไม่สอดคล้องกับ TanStack Router
5. **Scanner** → ใช้ `useAppStore` ผสมกับ router ทำให้ flow สับสน

### Journey ที่ขาดจาก buyer-web
- **Vault Journey**: ไม่มี ListItemModal, BulkListModal, RegisterItemModal, vault/store toggle, filter tabs (ALL/AVAILABLE/VAULT_HELD/LISTED), audit history, ownership tracking, delivery request
- **Market Journey**: ไม่มี market stats (last sold, average, min, max), recent sales, proper price chart component
- **Hooks**: ไม่มี useListingsBySeller, useCreateListing (for vault items), useDelistListing, useVaultDelivery, useMarketHistory, useMarketStats, useItemAuditHistory

## 2. แผนการ Implement (Phase เรียงลำดับความสำคัญ)

### Phase 1: Fix Broken Buttons (เร่งด่วน)
- [ ] สร้าง `ListItemModal` component (port จาก buyer)
- [ ] สร้าง `BulkListModal` component (port จาก buyer) 
- [ ] แก้ไข `VaultItemDetailScreen` → ใช้ ListItemModal แทน navigate
- [ ] แก้ไข `VaultScreen` → bulk list ใช้ BulkListModal
- [ ] แก้ไข `SplashScreen` → ใช้ TanStack Router navigate แทน setScreen
- [ ] แก้ไข `ScannerScreen` → ลบ useAppStore dependency

### Phase 2: Port Vault Journey (สำคัญ)
- [ ] เพิ่ม hooks ใน `useApi.ts` + `mockApi.ts`: useListingsBySeller, useDelistListing, useVaultDelivery, useItemAuditHistory, useUserAuditHistory
- [ ] สร้าง `VaultFilterTabs` component (port จาก buyer ใช้ dark UI)
- [ ] สร้าง `VaultProfileHeader` component (port จาก buyer ใช้ dark UI)
- [ ] สร้าง `RegisterItemModal` component (port จาก buyer)
- [ ] ปรับ `VaultScreen` → เพิ่ม vault/store toggle, filter tabs (ALL/AVAILABLE/VAULT_HELD/LISTED/IN_TRANSIT/COMPLETED/LOCKED), audit history
- [ ] ปรับ `VaultItemDetailScreen` → เพิ่ม audit history, ownership card, delivery request, list/unlist actions

### Phase 3: Port Market Journey (สำคัญ)
- [ ] เพิ่ม hooks: useMarketHistory, useMarketStats
- [ ] สร้าง `PriceChart` component (port จาก buyer ใช้ dark UI)
- [ ] ปรับ `ListingDetailScreen` → เพิ่ม market stats, recent sales, ปรับ price chart
- [ ] ปรับ `MarketScreen` → เพิ่ม market data quick view

### Phase 4: Polish & Consistency
- [ ] ตรวจสอบ i18n keys ให้สมบูรณ์
- [ ] ตรวจสอบ responsive behavior
- [ ] ตรวจสอบ loading states / empty states
- [ ] Build & verify

## 3. หลักการ Design (impeccable product register)

- **UI ต้องใช้ dark theme ของ swap-app**: สี surface #151936, brand #F06AA8, periwinkle #7B8AF5
- **Component vocabulary ต้องสอดคล้อง**: ใช้ shadcn/ui components ที่มีอยู่, ไม่สร้างใหม่โดยไม่จำเป็น
- **Motion**: 150-250ms, state-driven, ไม่ decorative
- **Typography**: Manrope font, fixed rem scale, JetBrains Mono สำหรับ data
- **Layout**: Mobile-first, bottom nav บน mobile, sidebar บน desktop
- **Accessibility**: focus rings, color ไม่ใช่ sole status indicator

## 4. Buyer → Swap การ map สี (dark UI)

| Buyer Token | Swap Equivalent |
|-------------|-----------------|
| `--color-brand-primary` | `brand` / `#F06AA8` |
| `--color-brand-secondary` | `periwinkle` / `#7B8AF5` |
| `--color-bg-default` | `surface` / `#151936` |
| `--color-bg-surface` | `surface-light` / `#1E2248` |
| `--color-bg-elevated` | `surface-lighter` / `#282D5A` |
| `--color-text-primary` | `foreground` / `#FFFFFF` |
| `--color-text-secondary` | `muted-foreground` |
| `--color-text-tertiary` | `text-muted-foreground` (lighter opacity) |
| `--color-border-default` | `border` / `#282D5A` |
| `--color-success` | `cyan` / `#4FE0D0` |
| `--color-danger` | `pldown` / `#EF4444` |
| `glass` | `bg-glass` / `bg-white/5 backdrop-blur-xl` |
