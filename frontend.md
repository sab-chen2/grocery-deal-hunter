# Frontend MVP: Grocery List and Price Comparison

## Summary

Replace the map workspace with this flow:

Enter ZIP → build grocery list → find stores carrying every item → compare prices.

Keep accounts, saved lists, and favorite stores in the MVP. Use the existing green styling, Geist fonts, and shopping-list functionality.

## Implementation Changes

- Remove map features completely: map component, Google Maps loader, Places search, geocoding endpoint, radius controls, coordinate filtering, map-specific types and CSS, and Google Maps packages. Update the lockfile and setup documentation. Keep Google Fonts and existing database location fields.
- Homepage /: show a labeled ZIP field, grocery-list editor, product selection, and “Compare prices” button. Reuse the existing shopping-list hook and panel; preserve browser storage.
- Require users to resolve custom item names to specific products and package sizes before comparing. Show unmatched items with a selection prompt.
- Comparison /compare: carry the submitted ZIP and list into results. Provide an “Edit search” action that preserves both.
- Best Single Location: show only stores in the exact ZIP with current price records for every requested product. Rank by quantity-adjusted total; show the cheapest store and up to two alternatives with itemized prices.
- If no store covers the entire list, show a clear empty state and actions to edit the list or ZIP. Do not display partial baskets as complete results.
- Best Weekly Deal: show the cheapest offer for each requested product across stores in the ZIP. This mode permits splitting purchases between stores; label that behavior clearly.
- Exclude coupons by default; allow explicit inclusion and show coupon requirements. Identify expired or unavailable offers without substituting zero prices.
- Keep /shoppinglist as a dedicated editor using the same list state. Replace all “Back to map” navigation with search or comparison navigation.
- Add /login, /signup, and /saved. Support named list snapshots, reopening and deleting lists, and favorite stores. Confirm before replacing a nonempty list; preserve the guest list through login and logout.

## Data and Backend Handoff

- Use exact ZIP filtering against store inventory; remove all Google requests and radius parameters.
- Reuse existing demo inventory and offer calculations. Clearly label demo results throughout.
- A current price record means a priced listing, not verified stock. Use “Listed items” wording until the backend supplies inventory availability.
- Define shared contracts for:
  - Product search: stable product ID, name, and package size.
  - Comparison: ZIP, products, quantities, and coupon preference in; complete ranked baskets, per-item best offers, and unmatched items out.
  - Session, signup, login, logout, saved-list operations, and favorite-store operations.
- Backend owns authorization, matching, validity checks, and monetary calculations in integer cents. Frontend displays estimated totals excluding tax and travel.
- Build clearly labeled fixture states while APIs are pending; account actions must report success only after backend confirmation.
- MySQL integration and reconciliation of existing PostgreSQL/Supabase code remain backend work. Do not edit historical migrations.

## Verification and Acceptance

- Verify ZIP codes with leading zeros and exact ZIP matching.
- Test complete baskets, missing products, no qualifying stores, tied totals, quantities, expired offers, and coupon inclusion.
- Confirm weekly mode can compare individual products even when no single store covers the list.
- Verify list persistence, failed requests, account session expiration, saved-list replacement, and favorites.
- Check mobile and desktop layouts, keyboard access, focus states, associated validation errors, and loading announcements.
- Run lint and production build; verify no Maps/Places imports, dependencies, requests, or setup requirements remain.
- Completion means a guest can search and compare without Google Maps, and account features persist through connected backend APIs.

Skipped implementation and live API checks during planning. Main risk: accurate results depend on backend product pricing; current price records do not guarantee stock.