import mockData from '../src/mock-data.json' with { type: 'json' };
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
const { stores, products, deals } = mockData;
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

stores.forEach(({ id: storeId, name, address, latitude: lat, longitude: lng }) => {
  statements.push(`INSERT INTO "Store" ("storeId", "name", "websiteUrl")
    VALUES (${storeId}, ${quote(name)}, 'https://grocery-demo.example')
    ON CONFLICT ("storeId") DO UPDATE SET "name" = EXCLUDED."name";`);
  statements.push(`INSERT INTO "StoreLocation" ("storeLocationId", "storeId", "addressLine1", "addressLine2", "city", "state", "zipCode", "country", "latitude", "longitude")
    VALUES (${storeId}, ${storeId}, ${quote(address)}, 'FICTIONAL DEMO LOCATION', 'Brooklyn', 'NY', '11201', 'US', ${lat}, ${lng})
    ON CONFLICT ("storeLocationId") DO UPDATE SET "addressLine1" = EXCLUDED."addressLine1";`);
});
products.forEach(({ productId, name, category, size, unit, prices }, p) => {
  statements.push(`INSERT INTO "Product" ("productId", "brand", "name", "category", "size", "unit", "updatedAt")
    VALUES (${productId}, 'Demo Pantry', ${quote(name)}, ${quote(category)}, ${quote(size)}, ${quote(unit)}, now())
    ON CONFLICT ("productId") DO UPDATE SET "name" = EXCLUDED."name", "category" = EXCLUDED."category",
    "size" = EXCLUDED."size", "unit" = EXCLUDED."unit", "updatedAt" = now();`);
  prices.forEach((regular, s) => {
    const deal = deals.find(deal => deal.storeLocationId === stores[s].id && deal.productId === productId);
    // Coupons stay conditional in Deal; do not advertise them as unconditional sale prices.
    const sale = deal && !deal.couponRequired ? (regular - deal.discountAmount).toFixed(2) : null;
    const effective = sale ?? regular;
    statements.push(`INSERT INTO "Price" ("priceId", "productId", "storeLocationId", "regularPrice", "salePrice", "unitPrice", "observedAt", "validFrom", "validUntil", "source")
      VALUES (${id(p * 3 + s)}, ${productId}, ${stores[s].id}, ${regular}, ${sale ?? 'NULL'}, ${Number(effective) / Number(size)}, now(), now() - interval '1 day', now() + interval '7 days', '${source}')
      ON CONFLICT ("priceId") DO UPDATE SET "regularPrice" = EXCLUDED."regularPrice", "salePrice" = EXCLUDED."salePrice",
      "unitPrice" = EXCLUDED."unitPrice", "observedAt" = EXCLUDED."observedAt", "validFrom" = EXCLUDED."validFrom", "validUntil" = EXCLUDED."validUntil";`);
  });
});
deals.forEach(({ storeLocationId, productId, discountAmount: discount, couponRequired: coupon, couponCode }, i) => {
  statements.push(`INSERT INTO "Deal" ("dealId", "productId", "storeLocationId", "dealType", "discountAmount", "couponRequired", "couponCode", "validFrom", "validUntil", "source")
    VALUES (${id(i)}, ${productId}, ${storeLocationId}, ${quote(coupon ? 'coupon' : 'sale')}, ${discount}, ${coupon}, ${quote(couponCode)}, now() - interval '1 day', now() + interval '7 days', '${source}')
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
