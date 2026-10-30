import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentOffers, distanceMeters } from '../src/demo-pricing.ts';
import { matchesStore, matchingProducts } from '../src/demo-store.ts';

const now = Date.parse('2026-10-30T12:00:00Z');
const products = [{ productId: 1, name: 'Large Eggs', brand: 'Demo Pantry', category: 'Dairy', size: '12', unit: 'count' }];
const price = { productId: 1, storeLocationId: 10, regularPrice: 4.29, salePrice: 2.79,
  observedAt: '2026-10-29T00:00:00Z', validFrom: '2026-10-28T00:00:00Z', validUntil: '2026-11-02T00:00:00Z' };

test('prices are scoped to the store, active dates and latest observation', () => {
  const rows = [price, { ...price, regularPrice: 99, salePrice: 99, storeLocationId: 11 },
    { ...price, salePrice: 0.01, validUntil: '2026-10-29T00:00:00Z', observedAt: '2026-10-30T00:00:00Z' },
    { ...price, salePrice: 3.29, observedAt: '2026-10-28T00:00:00Z' }];
  assert.equal(currentOffers(10, products, rows, [], now)[0].price, 2.79);
  assert.deepEqual(currentOffers(12, products, rows, [], now), []);
  assert.deepEqual(currentOffers(10, products, [{ ...price, validFrom: '2026-11-01T00:00:00Z' }], [], now), []);
});
test('coupon prices stay conditional and money is rounded to cents', () => {
  const deal = { productId: 1, storeLocationId: 10, couponRequired: true, couponCode: 'DEMO', discountAmount: 0.50,
    discountPercent: null, validFrom: null, validUntil: null };
  const offer = currentOffers(10, products, [price], [deal], now)[0];
  assert.equal(offer.price, 2.79);
  assert.deepEqual(offer.coupon, { code: 'DEMO', price: 2.29 });
  assert.equal(offer.onSale, true);
  assert.equal(offer.size, '12 count');
});
test('expired coupons are excluded and invalid/missing prices never become free items', () => {
  assert.deepEqual(currentOffers(10, products, [{ ...price, regularPrice: null }], [], now), []);
  const deal = { productId: 1, storeLocationId: 10, couponRequired: true, couponCode: 'OLD', discountAmount: 1,
    discountPercent: null, validFrom: null, validUntil: '2026-10-29T00:00:00Z' };
  assert.equal(currentOffers(10, products, [price], [deal], now)[0].coupon, null);
});
test('search finds item names, categories, store addresses and ZIPs without inventing Google prices', () => {
  const store = { id: 10, name: 'Demo Shop', address: 'Brooklyn NY 11201', latitude: 40.69, longitude: -73.98,
    source: 'demo', products: currentOffers(10, products, [price], [], now) };
  for (const query of ['egg', 'EGGS', 'dairy', 'large egg', '11201', 'demo shop']) assert.equal(matchesStore(store, query), true);
  assert.equal(matchingProducts(store, 'eggs')[0].price, 2.79);
  assert.equal(matchesStore(store, 'milk'), false);
  assert.equal(matchesStore({ ...store, source: 'google', products: undefined }, 'eggs'), false);
});
test('nearby radius separates Brooklyn fixtures from distant locations', () => {
  assert.equal(distanceMeters(40.69, -73.98, 40.69, -73.98), 0);
  assert.ok(distanceMeters(40.698, -73.985, 40.691, -73.991) < 1609);
  assert.ok(distanceMeters(40.698, -73.985, 34.052, -118.243) > 8047);
});
