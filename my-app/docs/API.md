# Grocery Deal Hunter API

## Implementation status

The grocery JSON API endpoints below are not implemented yet. Authentication is implemented through forms and Server Actions at `/auth/login` and `/auth/signup`, confirmation handlers at `/auth/callback` and `/auth/confirm`, and a protected `/shoppinglist` page. See [authentication setup](../app/auth/auth.md). All grocery endpoints below remain **proposed**, based on `src/prisma/contract.prisma`.

Prisma migrations create database tables; they do not generate Next.js API endpoints. This document describes our Next.js API, not Supabase's generated REST API.

## Addresses and local setup

- Local base URL: `http://localhost:3000` (use the port printed by Next.js).
- Shared staging base URL: not deployed yet.
- Production base URL: not deployed yet.
- Frontend requests in this app should use relative paths, for example `fetch('/api/deals')`.
- A teammate's `localhost` refers to their own computer. Use a deployed base URL to test a shared backend.

From `my-app`, install dependencies with `npm.cmd ci`, configure a private `.env`, and start the app with `npm.cmd run dev`. Prisma reads `DATABASE_URL` on the server. Do not include database passwords, connection strings, or secret keys in this document or Git.

## Proposed endpoints

Every row is planned, not currently callable. `:id` segments are placeholders for positive integer IDs from the existing Prisma models. “Session” means the backend must verify the signed-in user and resource access using the existing server-side Auth helpers.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/stores` | Public | List stores |
| GET | `/api/stores/:storeId` | Public | Get a store |
| GET | `/api/stores/:storeId/locations` | Public | List a store's locations |
| GET | `/api/products` | Public | Search products |
| GET | `/api/products/:productId` | Public | Get a product |
| GET | `/api/products/:productId/prices` | Public | Compare observed prices by store location |
| GET | `/api/deals` | Public | List and filter deals |
| GET | `/api/deals/:dealId` | Public | Get a deal |
| GET | `/api/me` | Session | Get the current user's profile |
| GET, POST | `/api/me/locations` | Session | List or add the user's locations |
| PATCH, DELETE | `/api/me/locations/:locationId` | Session | Edit or remove an owned location |
| GET, POST | `/api/grocery-lists` | Session | List owned grocery lists or create one |
| GET, PATCH, DELETE | `/api/grocery-lists/:listId` | Session | Read, rename, or delete an owned list |
| POST | `/api/grocery-lists/:listId/items` | Session | Add an item to an owned list |
| PATCH, DELETE | `/api/grocery-lists/:listId/items/:listItemId` | Session | Edit or remove an item belonging to that list |
| GET | `/api/grocery-lists/:listId/items/:listItemId/matches` | Session | Read stored product matches for an owned item |
| GET | `/api/me/favorite-lists` | Session | List favorite grocery lists |
| PUT, DELETE | `/api/me/favorite-lists/:listId` | Session | Favorite or unfavorite an accessible list |
| GET | `/api/me/followed-stores` | Session | List followed stores |
| PUT, DELETE | `/api/me/followed-stores/:storeId` | Session | Follow or unfollow a store |
| GET | `/api/me/followed-products` | Session | List followed products (Prisma `FollowedItem`) |
| PUT, DELETE | `/api/me/followed-products/:productId` | Session | Follow or unfollow a product |

Store, product, price, and deal writes need a separately designed administrative/import workflow. No public write endpoints are proposed for them.

## Proposed request and response conventions

- JSON request bodies use `Content-Type: application/json`.
- Success responses use `{ "data": ... }`; collection responses also include `page` and `pageSize`.
- Public collection endpoints accept `page` (default 1) and `pageSize` (default 20, maximum 100). Define stable ordering when implementing each endpoint.
- `/api/products` additionally accepts `q` and `category`.
- `/api/deals` additionally accepts `productId` and `storeLocationId`. Whether expired deals appear by default remains a team decision.
- Dates are ISO 8601 strings; optional values use `null`. Decimal money and percentage fields are serialized as strings to preserve precision.
- Use `200` for successful reads/updates, `201` for creation, and `204` with no response body for deletion.
- Errors use `{ "error": { "code": "...", "message": "..." } }`. Use `400` for invalid inputs, `401` for missing/invalid authentication, `404` for missing or inaccessible owned resources, `409` for conflicts, and `500` for unexpected errors. Never return database credentials or raw internal errors.

### Example: read deals (planned)

```http
GET /api/deals?productId=12&page=1&pageSize=20
```

Illustrative response with fictional data:

```json
{
  "data": [
    {
      "dealId": 1,
      "productId": 12,
      "storeLocationId": 3,
      "dealType": "discount",
      "discountAmount": "1.00",
      "discountPercent": null,
      "couponRequired": false,
      "couponCode": null,
      "validFrom": "2026-10-01T00:00:00Z",
      "validUntil": "2026-10-08T00:00:00Z",
      "source": null
    }
  ],
  "page": 1,
  "pageSize": 20
}
```

### Example: create a grocery list (planned)

```http
POST /api/grocery-lists
Content-Type: application/json

{ "name": "Weekly groceries" }
```

The server derives `userId` from the verified session, not the request body. Proposed response: `201` with `{ "data": { "listId": 1, "name": "Weekly groceries" } }`.

### Example: add an item (planned)

```http
POST /api/grocery-lists/1/items
Content-Type: application/json

{ "searchTerm": "milk", "quantity": 2 }
```

Require a nonempty search term and a positive integer quantity. Proposed response: `201` with `{ "data": { "listItemId": 1, "listId": 1, "searchTerm": "milk", "quantity": 2 } }`.

## Authentication and remaining design decisions

Supabase Auth and verified profile linking are implemented. The [Auth mapping migration](AUTH-MIGRATION.md) adds a unique, nullable `User.supabaseAuthId` alongside the existing integer `User.userId` and removes `passwordHash`. Apply that migration on each target database before using authentication. The legacy `Session` model remains unchanged and is not used by this Auth flow.

Define full request/response fields for each endpoint as it is built. Also decide list sharing rules, deletion of related records, product matching behavior, and whether following/favoriting is idempotent (recommended). The current schema does not automatically implement these behaviors.

## Keeping this reference useful

1. Implement and test an endpoint before marking it implemented.
2. In the same PR, document its exact method, path, access rules, filters, body, response, and errors here.
3. Add the deployed base URL when a shared backend exists.
4. Share this file through the repository. Teammates can use browser fetch, curl, or Postman once endpoints are implemented.

Suggested implementation order: stores and products, deals and prices, authentication mapping, grocery lists/items, then favorites and follows.
