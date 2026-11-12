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
hosts and database names other than `grocery_deal_hunter`. Seeding only populates the database. The frontend demo reads the same catalog
from `src/mock-data.json` and does not require PostgreSQL.

## Working on the project

### Demo catalog and price comparison

The homepage and /compare use GET /api/demo/stores, backed by
`src/mock-data.json`. No database or Google API key is needed for this flow.
Use ZIP **11201**; other ZIPs return no demo stores. Search products, add them to
your list, and match custom items to a product and package size before comparing.

The mock file lists 3 stores, 15 products with stable productId values
(-91000 through -91014), 45 regular package prices, and 6 deals. Each product's
prices array follows the stores array order: Fresh Basket, Budget Pantry,
Neighborhood Foods. Prices are USD per package, not per ounce or pound.
Deals reference storeLocationId and productId. The database seed script uses
this same file, so product IDs remain compatible with existing browser lists.
Static mock offers do not expire; the optional database seed applies dates.

**One store** ranks only complete baskets and displays the best three.
**Split & save** finds the cheapest offer for each product, includes quantities,
and shows a complete total and savings against the cheapest complete basket.
Missing products prevent a complete total. Names are display labels; comparison
uses product IDs to avoid confusing different packages with similar names.
Ordinary sales apply automatically. Coupon prices are opt-in and show the code
only when that coupon reduces the selected price. Calculations use integer cents.

Run the demo checks from my-app:

```bash
node --test tests/compare-offers.test.mjs tests/mock-comparison.test.mjs tests/shopping-list.test.mjs
```

### Guest shopping list

Use the shopping panel on the homepage, or visit
`/shoppinglist` for the full list page. Add any grocery item by name and quantity;
an item does not need a known price, a discount, or a matching database product.
Every demo product also has **Add**, including regular-price products.
Repeated additions of the same product increase its quantity across stores.

Change quantities using plus/minus or edit the number and press Enter or leave
the field. Quantities must be whole numbers from 1 to 999; use **Remove** to delete
an item. Guest lists persist in this browser's local storage and sync between
the homepage panel, full list page, and browser tabs. They are not yet saved to a user
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
