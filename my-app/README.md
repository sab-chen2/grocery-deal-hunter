# Grocery Deal Hunter

A grocery deal hunter built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## First-time setup

You do not need to download Next.js separately or install it globally. This repository already contains the app; installing its dependencies will install Next.js, React, TypeScript, and the other required packages locally.

### 1. Install the tools

- Install the **LTS version of [Node.js](https://nodejs.org/)**. It includes npm, the package manager used here. Next.js requires Node.js 20.9 or newer; see the [official requirements](https://nextjs.org/docs/app/getting-started/installation).
- Install [Git](https://git-scm.com/downloads) to clone the repository and collaborate.
- Use a code editor such as [Visual Studio Code](https://code.visualstudio.com/).

After installing, reopen your terminal or VS Code and check:

```bash
node --version
npm --version
git --version
```

Each command should print a version number.

### 2. Download the project

In a terminal, run:

```bash
git clone --branch develop https://github.com/sab-chen2/grocery-deal-hunter.git
cd grocery-deal-hunter/my-app
```

If you already downloaded or cloned the repository, open it and navigate to its `my-app` folder instead. All npm commands below must run inside `my-app`, where `package.json` is located.

### 3. Install the dependencies

```bash
npm ci
```

This installs the versions recorded in `package-lock.json` into `node_modules`. An internet connection is required. Do this when setting up the project and again after pulling changes to the dependency files.

Do not run `create-next-app`: that creates a new project, and this project already exists.

### 4. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. If that port is busy, use the local URL printed in the terminal.

Keep the terminal running while working. Saved code changes appear in the browser automatically. Press **Ctrl+C** in the terminal to stop the server.

## Local demo database

After configuring `DATABASE_URL` in your ignored `.env` and applying the existing
migrations with `npx prisma db migrate`, run from `my-app`:

```bash
npm run db:seed:demo
```

This seeds the local `grocery_deal_hunter` database with 3 fictional Brooklyn
stores in ZIP code **11201**, 15 grocery products, 45 USD price records, and 6
weekly deals. Names, addresses, coordinates, brands, and prices are fictional
demo fixtures, not real store offers. Five deals are ordinary sales; one yogurt
deal requires coupon `DEMOYOGURT`. The coupon discount is not included in the
unconditional sale price. `unitPrice` is USD per product `unit` (for example,
per ounce or per pound), while regular and sale prices are per package.

Rerunning the command updates the same demo records and refreshes offers to
expire seven days later. It does not clear existing tables. Demo records use
reserved negative IDs starting at -91000, brand `Demo Pantry`, and price/deal
source `fictional-demo-v1`. Unrelated records occupying those IDs cause the
transaction to abort. No authentication accounts are created.

The command requires `psql` on PATH or PostgreSQL 18 at its standard Windows
installation path; set `PSQL_PATH` for another installation. It refuses remote
hosts and database names other than `grocery_deal_hunter`. Seeding only populates
the database; the current pages still need API connections to display this data.

## Working on the project

### Demo store map

The homepage fills the viewport with Google Maps and overlays a searchable,
collapsible store panel. Fictional store locations load from `GET /api/demo/stores`,
backed by the configured PostgreSQL database. Seed the demo data first using the
command above. Select a store card or numbered marker to highlight its location.
Searching filters the cards while keeping all pins on the map. On mobile,
the panel sits at the bottom. The page initially shows local demo records.
Enter a five-digit US ZIP code, choose a 1-, 3-, or 5-mile radius, and press
**Find nearby stores** to switch to real Google Places results. Nearby Search
returns up to 20 grocery stores and supermarkets ranked by distance; it is not
a complete inventory of every business. **Use demo data** returns to local
fixtures. Real stores show **Prices unavailable** and never receive fake prices.

### Demo item and price search

Choose **Demo stores & prices**, enter ZIP **11201**, select a radius, and press
**Find nearby stores**. Search for `egg`, `milk`, `bread`, categories, store names,
addresses, or ZIPs. Cards show package sizes, USD prices, sales, and conditional
coupon prices. Select a store or **See all 15 items** to expand its inventory.
Map popups include sample prices. These are fictional offers, not live stock.
Demo inventory is currently in Brooklyn. Other ZIPs are geocoded and filter the
fixtures by distance; distant searches return no demo inventory. Choose **Real
stores on Google Maps** for Places discovery without fabricated product prices.

`GET /api/demo/stores` includes each store's current `products`. Optional `q`
filters items/stores, `zip` filters an exact ZIP, and `lat`, `lng`, `radius` filter
nearby coordinates (radius: 1609, 4828, or 8047 meters). Example:
`/api/demo/stores?q=egg&zip=11201`. Expired/future prices and coupons are excluded.
Run `npm run db:seed:demo` to renew dates, and
`node --test tests/demo-pricing.test.mjs` to check pricing and search logic.

The map uses Google Maps JavaScript API. Add your browser key to the ignored
`my-app/.env`, then restart the development server:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_browser_api_key
```

The map and marker libraries load for the map. Submitting a ZIP search calls
`GET /api/location?zip=11201`, which uses **Geocoding v4** on the server. It then
performs one Nearby Search request through the browser's Places library. The old
JavaScript Geocoder service is not used: that service can require billing even
when the official Maps Demo Key supports v4 without billing.

Enable **Maps JavaScript API**, **Geocoding API**, and **Places API (New)** in the
project, with appropriate key permissions. The ZIP endpoint uses
`GOOGLE_MAPS_GEOCODING_API_KEY` when configured, otherwise the existing public
demo key. If the browser key has HTTP-referrer restrictions that reject server
calls, configure a separate server key restricted to Geocoding rather than
loosening the browser key. Keys are sent to Google in headers and never returned
by the endpoint. Responses are not cached. Searches occur only on submission,
not while typing or panning. Directions are not requested. Advanced
markers use Google's `DEMO_MAP_ID` by default; this is a map ID, not an API key
or a free billing tier. Optionally set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` to your
own map ID for cloud styling. Demo keys remain subject to their issuing project's
permissions, website restrictions, billing, and quotas. Enable Maps JavaScript
API for the key and allow your local development URL. Browser keys are visible
to users, so apply website and API restrictions.

Missing keys and map load failures show a message while keeping demo store cards
available. Search failures show configuration guidance without silently
substituting fictional stores. Google results stay in memory and are not copied
to PostgreSQL or browser storage. Each API has its own permissions, quota, and
usage rules; the official [Maps Demo Key](https://developers.google.com/maps/demo-key)
supports listed features including Geocoding v4 with daily limits and no billing
setup. This does not make ordinary production keys free. Basket
totals, arbitrary street-address lookup, and directions are not implemented yet.

Run ZIP lookup regression checks with `node --test tests/location-route.test.mjs`
(requires Node.js with native TypeScript support, such as the installed Node 26).

### Guest shopping list

Use **My shopping list** on the map to open the shopping panel, or visit
`/shoppinglist` for the full list page. Add any grocery item by name and quantity;
an item does not need a known price, a discount, or a matching database product.
Every demo product also has **Add to list**, including regular-price products.
Repeated additions of the same product increase its quantity across stores.

Change quantities using plus/minus or edit the number and press Enter or leave
the field. Quantities must be whole numbers from 1 to 999; use **Remove** to delete
an item. Guest lists persist in this browser's local storage and sync between
the map panel, full list page, and browser tabs. They are not yet saved to a user
account or PostgreSQL. If browser storage is blocked, the panel explains that the
list only lasts for the current session. Stored lists contain names, quantities,
and optional product/package identifiers, not stale offer prices.

Run shopping-list checks with `node --test tests/shopping-list.test.mjs`.

The next time you work on the app, open a terminal in `my-app` and run `npm run dev`.

```text
my-app/
|-- app/
|   |-- page.tsx                # Homepage: /
|   |-- layout.tsx              # Shared layout for pages
|   |-- globals.css             # Global styles
|   `-- shoppinglist/
|       `-- page.tsx            # Shopping list route: /shoppinglist
|-- public/                    # Static files, such as images
|-- package.json               # Dependencies and commands
|-- package-lock.json          # Locked dependency versions
`-- tsconfig.json              # TypeScript configuration
```

- Write React pages and components in `.tsx` files; use `.ts` for TypeScript code without JSX.
- `app/page.tsx` is the main page. Other `page.tsx` files define separate routes; they do not automatically appear on the homepage.
- `node_modules/` and `.next/` are generated locally and ignored by Git.
- When intentionally adding a dependency, use `npm install package-name` and commit both `package.json` and `package-lock.json`.

## Available commands

Run these from `my-app`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Check code with ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build after `npm run build` |

## Troubleshooting

- **`node` or `npm` is not recognized:** Install Node.js, then reopen your terminal or VS Code.
- **PowerShell says `npm.ps1` cannot run:** Use `npm.cmd ci` and `npm.cmd run dev`, or switch the VS Code terminal to Command Prompt. The same `npm.cmd` substitution works for the other npm commands.
- **Cannot find `package.json`:** Check that your terminal is inside `grocery-deal-hunter/my-app`.
- **`next` is not recognized or dependencies are missing:** Run `npm ci` inside `my-app`, then retry `npm run dev`.
- **`npm ci` reports a lockfile mismatch:** Ask the teammate who changed dependencies to update and commit `package-lock.json` alongside `package.json`.
- **Font download fails:** The app uses `next/font/google` for Geist fonts. Check your internet connection and access to Google Fonts, then retry.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React documentation](https://react.dev/learn)
