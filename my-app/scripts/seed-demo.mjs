import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const connection = new URL(process.env.DATABASE_URL || 'postgresql://localhost');
if (!['localhost', '127.0.0.1', '[::1]'].includes(connection.hostname) ||
    connection.pathname !== '/grocery_deal_hunter') {
  throw new Error('Demo seeding is restricted to the local grocery_deal_hunter database.');
}
const windowsPsql = 'C:/Program Files/PostgreSQL/18/bin/psql.exe';
const psql = process.env.PSQL_PATH || (existsSync(windowsPsql) ? windowsPsql : 'psql');
const quote = (value) => value == null ? 'NULL' : `'${String(value).replaceAll("'", "''")}'`;
const source = 'fictional-demo-v1';
const stores = [
  ['Demo Fresh Basket', '10 Demo Market Lane', 40.694, -73.986],
  ['Demo Budget Pantry', '20 Demo Grocery Avenue', 40.691, -73.991],
  ['Demo Neighborhood Foods', '30 Demo Produce Street', 40.698, -73.982],
];
// All prices are USD per package; sizes are shared across stores for fair comparisons.
const products = [
  ['Whole Milk', 'Dairy', '1', 'gallon', [4.49, 4.19, 4.79]],
  ['Large Eggs', 'Dairy', '12', 'count', [3.99, 3.49, 4.29]],
  ['Whole Wheat Bread', 'Bakery', '20', 'oz', [3.29, 2.99, 3.59]],
  ['Bananas', 'Produce', '1', 'lb', [0.69, 0.59, 0.79]],
  ['Gala Apples', 'Produce', '3', 'lb', [4.99, 4.49, 5.29]],
  ['Chicken Breast', 'Meat', '1', 'lb', [4.99, 5.49, 5.29]],
  ['White Rice', 'Pantry', '2', 'lb', [2.99, 2.49, 3.29]],
  ['Spaghetti', 'Pantry', '16', 'oz', [1.79, 1.49, 1.99]],
  ['Tomato Pasta Sauce', 'Pantry', '24', 'oz', [2.79, 2.49, 2.99]],
  ['Cheddar Cheese', 'Dairy', '8', 'oz', [2.99, 2.79, 3.49]],
  ['Plain Greek Yogurt', 'Dairy', '32', 'oz', [5.49, 4.99, 5.79]],
  ['Frozen Broccoli', 'Frozen', '12', 'oz', [1.99, 1.79, 2.29]],
  ['Rolled Oats', 'Pantry', '18', 'oz', [3.49, 2.99, 3.79]],
  ['Peanut Butter', 'Pantry', '16', 'oz', [2.99, 2.69, 3.29]],
  ['Orange Juice', 'Beverages', '52', 'fl oz', [3.99, 3.79, 4.49]],
];
// store index, product index, discount dollars, coupon required
const deals = [[0, 5, 1, false], [0, 9, 0.5, false], [1, 0, 0.5, false],
  [1, 6, 0.5, false], [2, 1, 1.5, false], [2, 10, 1, true]];
const id = (index) => -91000 - index;
const statements = ['BEGIN;', "SELECT pg_advisory_xact_lock(910001);"];

// Negative IDs reserve a demo namespace without changing normal auto-increment sequences.
// Refuse collisions rather than overwrite unrelated records.
statements.push(`DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "Store" WHERE "storeId" BETWEEN -91002 AND -91000
    AND "websiteUrl" IS DISTINCT FROM 'https://grocery-demo.example')
  OR EXISTS (SELECT 1 FROM "StoreLocation" WHERE "storeLocationId" BETWEEN -91002 AND -91000
    AND "addressLine2" IS DISTINCT FROM 'FICTIONAL DEMO LOCATION')
  OR EXISTS (SELECT 1 FROM "Product" WHERE "productId" BETWEEN -91014 AND -91000
    AND "brand" IS DISTINCT FROM 'Demo Pantry')
  OR EXISTS (SELECT 1 FROM "Price" WHERE "priceId" BETWEEN -91044 AND -91000
    AND "source" IS DISTINCT FROM '${source}')
  OR EXISTS (SELECT 1 FROM "Deal" WHERE "dealId" BETWEEN -91005 AND -91000
    AND "source" IS DISTINCT FROM '${source}') THEN
    RAISE EXCEPTION 'Demo ID collision; no changes applied';
  END IF;
END $$;`);

stores.forEach(([name, address, lat, lng], i) => {
  statements.push(`INSERT INTO "Store" ("storeId", "name", "websiteUrl")
    VALUES (${id(i)}, ${quote(name)}, 'https://grocery-demo.example')
    ON CONFLICT ("storeId") DO UPDATE SET "name" = EXCLUDED."name";`);
  statements.push(`INSERT INTO "StoreLocation" ("storeLocationId", "storeId", "addressLine1", "addressLine2", "city", "state", "zipCode", "country", "latitude", "longitude")
    VALUES (${id(i)}, ${id(i)}, ${quote(address)}, 'FICTIONAL DEMO LOCATION', 'Brooklyn', 'NY', '11201', 'US', ${lat}, ${lng})
    ON CONFLICT ("storeLocationId") DO UPDATE SET "addressLine1" = EXCLUDED."addressLine1";`);
});
products.forEach(([name, category, size, unit, prices], p) => {
  statements.push(`INSERT INTO "Product" ("productId", "brand", "name", "category", "size", "unit", "updatedAt")
    VALUES (${id(p)}, 'Demo Pantry', ${quote(name)}, ${quote(category)}, ${quote(size)}, ${quote(unit)}, now())
    ON CONFLICT ("productId") DO UPDATE SET "name" = EXCLUDED."name", "category" = EXCLUDED."category",
    "size" = EXCLUDED."size", "unit" = EXCLUDED."unit", "updatedAt" = now();`);
  prices.forEach((regular, s) => {
    const deal = deals.find(([store, product]) => store === s && product === p);
    // Coupons stay conditional in Deal; do not advertise them as unconditional sale prices.
    const sale = deal && !deal[3] ? (regular - deal[2]).toFixed(2) : null;
    const effective = sale ?? regular;
    statements.push(`INSERT INTO "Price" ("priceId", "productId", "storeLocationId", "regularPrice", "salePrice", "unitPrice", "observedAt", "validFrom", "validUntil", "source")
      VALUES (${id(p * 3 + s)}, ${id(p)}, ${id(s)}, ${regular}, ${sale ?? 'NULL'}, ${Number(effective) / Number(size)}, now(), now() - interval '1 day', now() + interval '7 days', '${source}')
      ON CONFLICT ("priceId") DO UPDATE SET "regularPrice" = EXCLUDED."regularPrice", "salePrice" = EXCLUDED."salePrice",
      "unitPrice" = EXCLUDED."unitPrice", "observedAt" = EXCLUDED."observedAt", "validFrom" = EXCLUDED."validFrom", "validUntil" = EXCLUDED."validUntil";`);
  });
});
deals.forEach(([s, p, discount, coupon], i) => {
  statements.push(`INSERT INTO "Deal" ("dealId", "productId", "storeLocationId", "dealType", "discountAmount", "couponRequired", "couponCode", "validFrom", "validUntil", "source")
    VALUES (${id(i)}, ${id(p)}, ${id(s)}, ${quote(coupon ? 'coupon' : 'sale')}, ${discount}, ${coupon}, ${quote(coupon ? 'DEMOYOGURT' : null)}, now() - interval '1 day', now() + interval '7 days', '${source}')
    ON CONFLICT ("dealId") DO UPDATE SET "discountAmount" = EXCLUDED."discountAmount", "couponRequired" = EXCLUDED."couponRequired",
    "couponCode" = EXCLUDED."couponCode", "validFrom" = EXCLUDED."validFrom", "validUntil" = EXCLUDED."validUntil";`);
});
statements.push(`COMMIT;
SELECT 'demo stores' AS dataset, count(*) FROM "Store" WHERE "websiteUrl" = 'https://grocery-demo.example'
UNION ALL SELECT 'demo products', count(*) FROM "Product" WHERE "brand" = 'Demo Pantry'
UNION ALL SELECT 'demo prices', count(*) FROM "Price" WHERE "source" = '${source}'
UNION ALL SELECT 'demo deals', count(*) FROM "Deal" WHERE "source" = '${source}';`);

const result = spawnSync(psql, ['-X', '-w', '-v', 'ON_ERROR_STOP=1', '-q'], {
  input: statements.join('\n'), encoding: 'utf8',
  env: { ...process.env, PGHOST: connection.hostname.replaceAll(/[\[\]]/g, ''),
    PGPORT: connection.port || '5432', PGDATABASE: connection.pathname.slice(1),
    PGUSER: decodeURIComponent(connection.username), PGPASSWORD: decodeURIComponent(connection.password) },
});
if (result.error) throw new Error(`Cannot run psql. Install PostgreSQL client tools or set PSQL_PATH. ${result.error.message}`);
if (result.stdout) process.stdout.write(result.stdout);
if (result.status !== 0) {
  // Never echo the connection URL or password when reporting a connection failure.
  process.stderr.write((result.stderr || 'Demo seed failed.').replaceAll(decodeURIComponent(connection.password) || '\0', '[redacted]'));
  process.exit(1);
}
console.log('Fictional demo data ready. Rerunning refreshes prices and seven-day deal validity without duplicates.');
