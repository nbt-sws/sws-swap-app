# SWS Partner Service API Integration Guide

This document defines the **store-centric Partner Service API** for SwibSwap (SWS). The model is designed so that **each shop/lab registers as a partner, receives its own whitelabel store page on SWS, and can offer Pre-grade and/or Grade services** to collectors.

> **Status:** Frontend contract implemented; backend endpoints are stubs documented below. Use `VITE_USE_MOCK_API=true` to exercise the UI flow without a live backend.

---

## 1. Concept

Every partner is a **store** on SWS:

1. A shop submits a **partner application**.
2. SWS admins review and approve it.
3. On approval, SWS creates:
   - a `StoreProfile` (whitelabel store page at `/seller/:storeId`),
   - one or more `ServiceProvider` records attached to that store — one per category (`PREGRADE`, `GRADE`).
4. Collectors browse services by category, choose a **store**, and create a service order.
5. The partner updates order status via the API; collectors receive notifications and track progress.

---

## 2. Authentication

### Collector-facing endpoints
Use the standard SWS user access token:

```http
Authorization: Bearer <user-access-token>
Content-Type: application/json
```

### Partner/admin endpoints
Approved partners receive a **partner API key** tied to their store:

```http
Authorization: Bearer <partner-api-key>
Content-Type: application/json
```

Admins use a separate admin token for review endpoints.

---

## 3. Partner onboarding

### 3.1 Submit an application

A prospective shop applies from the SWS app or a public landing page.

```http
POST /api/v1/partners/applications
```

**Request body**

```json
{
  "companyName": "Acme Cards Bangkok",
  "contactName": "Jane Doe",
  "email": "partners@acme.example",
  "phone": "+66 2 123 4567",
  "website": "https://acme.example",
  "serviceCategories": ["PREGRADE", "GRADE"],
  "serviceTypes": ["Physical pre-grade", "Professional grading", "Sub-grades"],
  "message": "Certified TCG shop with in-house pre-grading and monthly PSA/BGS batch submissions."
}
```

**Response `201 Created`**

```json
{
  "application": {
    "id": "SWS-PA-004321",
    "companyName": "Acme Cards Bangkok",
    "contactName": "Jane Doe",
    "email": "partners@acme.example",
    "phone": "+66 2 123 4567",
    "website": "https://acme.example",
    "serviceCategories": ["PREGRADE", "GRADE"],
    "serviceTypes": ["Physical pre-grade", "Professional grading", "Sub-grades"],
    "message": "Certified TCG shop with in-house pre-grading...",
    "status": "PENDING",
    "createdAt": "2026-07-10T12:00:00Z",
    "updatedAt": "2026-07-10T12:00:00Z"
  }
}
```

### 3.2 Admin review and store creation

Admins review applications and, on approval, create the whitelabel store and service provider profiles.

```http
GET    /api/v1/admin/partners/applications
PATCH  /api/v1/admin/partners/applications/:id
```

**Review body**

```json
{
  "status": "APPROVED",
  "reviewerNotes": "Verified shop license. Approved for PREGRADE and GRADE.",
  "serviceCategories": ["PREGRADE", "GRADE"],
  "store": {
    "displayName": "Acme Cards Bangkok",
    "location": "Bangkok, Thailand",
    "bio": "Certified TCG shop offering pre-grade and professional grading services."
  }
}
```

**What the backend does on approval**

- Creates a `StoreProfile` for the applicant.
- Creates one `ServiceProvider` per approved category, linked to the new `storeId`.
- Generates a partner API key and webhook secret.
- Sends a welcome email with credentials and a link to `/seller/:storeId`.
- Updates the application with `storeId` and `storeName`.

### 3.3 Re-fetch application status

```http
GET /api/v1/partners/applications/:id
```

---

## 4. Service provider catalog

The public app fetches providers by category. Each provider is backed by a store.

```http
GET /api/v1/services/providers?category=PREGRADE|GRADE
```

**Response `200 OK`**

```json
{
  "providers": [
    {
      "id": "s1-pregrade",
      "storeId": "s1",
      "storeName": "kaido99",
      "storeAvatarUrl": "https://cdn.swibswap.app/avatars/s1.png",
      "storeBannerUrl": "https://cdn.swibswap.app/banners/s1.png",
      "category": "PREGRADE",
      "serviceTypes": ["Physical pre-grade", "AI surface scan", "Human review"],
      "description": "In-person pre-grade at our Bangkok shop with same-day scoring.",
      "deliveryMode": "PHYSICAL_DROP_OFF",
      "turnaround": "Same day – 3 days",
      "pricePerCard": 300,
      "currency": "THB",
      "scoreLabel": "kaido99 9.5",
      "color": "brand",
      "enabled": true
    }
  ]
}
```

### Delivery modes

| Value              | Meaning                                       |
|--------------------|-----------------------------------------------|
| `PHOTO_UPLOAD`     | Collector uploads scans; no physical shipping |
| `PHYSICAL_DROP_OFF`| Drop cards at the partner shop                |
| `PHYSICAL_SHIP`    | Ship cards to the partner or their lab        |

### Admin/provider management

```http
POST   /api/v1/admin/services/providers
PATCH  /api/v1/admin/services/providers/:id
DELETE /api/v1/admin/services/providers/:id
```

A partner can also update their own provider settings:

```http
PATCH /api/v1/partners/services/providers/:id
```

---

## 5. Service orders

### 5.1 Create an order

A collector chooses a provider-store and submits cards from their vault.

```http
POST /api/v1/service-orders
Authorization: Bearer <user-access-token>
```

**Request body**

```json
{
  "category": "GRADE",
  "providerId": "s1-grade",
  "cardIds": ["v1", "v2"],
  "shippingAddress": {
    "name": "BoBoBoA",
    "phone": "+66 81 234 5678",
    "address": "88 Sukhumvit 24, Klongton",
    "province": "Bangkok",
    "postalCode": "10110"
  }
}
```

**Response `201 Created`**

```json
{
  "order": {
    "id": "SWS-SO-004217",
    "userId": "u1",
    "category": "GRADE",
    "providerId": "s1-grade",
    "providerName": "kaido99",
    "storeId": "s1",
    "cardIds": ["v1", "v2"],
    "status": "PENDING",
    "totalAmount": 2200,
    "currency": "THB",
    "shippingAddress": { ... },
    "createdAt": "2026-07-10T12:00:00Z",
    "updatedAt": "2026-07-10T12:00:00Z"
  }
}
```

### 5.2 Partner lists their orders

```http
GET /api/v1/partners/orders?status=PENDING
Authorization: Bearer <partner-api-key>
```

### 5.3 Partner updates order status

```http
PATCH /api/v1/partners/orders/:id
Authorization: Bearer <partner-api-key>
```

**Request body**

```json
{
  "status": "IN_PROGRESS",
  "trackingNumber": "TH123456789",
  "metadata": {
    "labOrderNumber": "78912345",
    "estimatedCompletion": "2026-08-15"
  }
}
```

### Order statuses

| Status        | Description                              |
|---------------|------------------------------------------|
| `PENDING`     | Created, awaiting card receipt           |
| `RECEIVED`    | Cards received by the partner            |
| `IN_PROGRESS` | Grading / scoring in progress            |
| `COMPLETED`   | Report ready or slab graded              |
| `CANCELLED`   | Cancelled by collector or partner        |

---

## 6. Webhooks

SWS and partners exchange event notifications.

### 6.1 SWS → Partner (new order for your store)

When a collector creates an order for a partner’s store, SWS POSTs to the configured webhook URL:

```http
POST https://partner.example/sws-webhook
X-SWS-Signature: sha256=<hmac>
```

```json
{
  "event": "service_order.created",
  "timestamp": "2026-07-10T12:00:00Z",
  "order": {
    "id": "SWS-SO-004217",
    "category": "GRADE",
    "providerId": "s1-grade",
    "storeId": "s1",
    "cardIds": ["v1", "v2"],
    "status": "PENDING",
    "totalAmount": 2200,
    "currency": "THB",
    "shippingAddress": { ... }
  }
}
```

Verify the HMAC:

```python
import hmac, hashlib
expected = hmac.new(webhook_secret, payload_bytes, hashlib.sha256).hexdigest()
```

### 6.2 Partner → SWS (status update)

Partners call `PATCH /partners/orders/:id`; SWS then notifies the collector.

### 6.3 Supported events

| Event                          | Direction      | Description                     |
|--------------------------------|----------------|---------------------------------|
| `service_order.created`        | SWS → Partner  | New order assigned to store     |
| `service_order.status_changed` | SWS → Collector| Order status updated            |
| `partner.application.approved` | SWS → Applicant| Application approved            |
| `partner.application.rejected` | SWS → Applicant| Application rejected            |

---

## 7. Type reference

### `ApiServiceProvider`

```ts
interface ApiServiceProvider {
  id: string;
  storeId: string;
  storeName: string;
  storeAvatarUrl?: string;
  storeBannerUrl?: string;
  category: 'PREGRADE' | 'GRADE';
  serviceTypes: string[];
  description: string;
  deliveryMode: 'PHOTO_UPLOAD' | 'PHYSICAL_DROP_OFF' | 'PHYSICAL_SHIP';
  turnaround: string;
  pricePerCard: number;
  currency: string;
  scoreLabel: string;
  subScores?: { label: string; value: number }[];
  color: 'brand' | 'periwinkle' | 'cyan' | 'pregrade' | 'plup';
  logoUrl?: string;
  enabled: boolean;
}
```

### `ApiServiceOrder`

```ts
interface ApiServiceOrder {
  id: string;
  userId: string;
  category: 'PREGRADE' | 'GRADE';
  providerId: string;
  providerName: string;
  storeId: string;
  cardIds: string[];
  status: 'PENDING' | 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  shippingAddress?: ApiShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}
```

### `ApiPartnerApplication`

```ts
interface ApiPartnerApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  serviceCategories: ('PREGRADE' | 'GRADE')[];
  serviceTypes: string[];
  message?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  storeId?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 8. Error codes

| HTTP | Code                     | Meaning                                      |
|------|--------------------------|----------------------------------------------|
| 400  | `INVALID_PAYLOAD`        | Request body failed validation               |
| 401  | `UNAUTHORIZED`           | Missing or invalid token / API key           |
| 403  | `FORBIDDEN`              | Key valid but not scoped to this store       |
| 404  | `NOT_FOUND`              | Order, application, or store not found       |
| 409  | `DUPLICATE_APPLICATION`  | Pending application already exists           |
| 422  | `UNSUPPORTED_STATUS`     | Invalid status transition                    |

---

## 9. Implementation checklist

- [ ] Implement `POST /partners/applications`.
- [ ] Implement admin review endpoints.
- [ ] On approval, create `StoreProfile` + `ServiceProvider` records.
- [ ] Issue partner API keys and webhook secrets.
- [ ] Implement `GET /services/providers` with optional `category` filter.
- [ ] Implement `POST /service-orders`.
- [ ] Implement partner-scoped `GET /partners/orders` and `PATCH /partners/orders/:id`.
- [ ] Add webhook delivery service for `service_order.created`.
- [ ] Add idempotency key support for order creation (`Idempotency-Key` header).

---

## 10. Contact

For partner onboarding questions, contact `partners@swibswap.app`.
