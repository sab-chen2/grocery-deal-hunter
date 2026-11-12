import { test } from 'node:test';
import assert from 'node:assert/strict';
import data from '../src/mock-data.json' with { type: 'json' };
import { mockStores } from '../src/mock-stores.ts';
import { compareOffers } from '../src/compare-offers.ts';
import { GET } from '../app/api/demo/stores/route.ts';

const item = (productId, quantity = 1) => ({ id: `product:${productId}`, productId, name: 'Display name may change', quantity });

test('mock catalog preserves 15 unique product IDs and 45 package prices', () => {
  assert.equal(new Set(data.products.map(product => product.productId)).size, 15);
  assert.equal(new Set(data.stores.map(store => store.id)).size, 3);
  assert.equal(mockStores.flatMap(store => store.products).length, 45);
  for (const product of data.products) {
    assert.equal(product.prices.length, data.stores.length);
    assert.ok(product.name && product.size && product.unit);
    assert.ok(product.prices.every(price => Number.isFinite(price) && price >= 0));
  }
  for (const deal of data.deals) {
    assert.ok(data.products.some(product => product.productId === deal.productId));
    assert.ok(data.stores.some(store => store.id === deal.storeLocationId));
  }
});

test('demo milk and eggs compare by ID, quantity and sale price', () => {
  const result = compareOffers(mockStores, [item(-91000, 2), item(-91001)]);
  assert.deepEqual(result.baskets.map(basket => [basket.store.name, basket.total]), [
    ['Demo Budget Pantry', 1087], ['Demo Neighborhood Foods', 1237], ['Demo Fresh Basket', 1297],
  ]);
  assert.equal(result.splitTotal, 1017);
  assert.equal(result.savings, 70);
  assert.deepEqual(result.bestOffers.map(line => line.best.store.id), [-91001, -91002]);
});

test('coupon toggle changes the yogurt winner and labels only an applied coupon', () => {
  const plain = compareOffers(mockStores, [item(-91010, 2)]);
  const coupon = compareOffers(mockStores, [item(-91010, 2)], true);
  assert.equal(plain.baskets[0].total, 998);
  assert.equal(coupon.baskets[0].total, 958);
  assert.equal(coupon.baskets[0].store.id, -91002);
  assert.equal(coupon.baskets[0].lines[0].couponApplied, true);
  assert.equal(plain.baskets[0].lines[0].couponApplied, false);
});

test('missing IDs, custom names and invalid quantities cannot produce misleading totals', () => {
  for (const missing of [item(123), { id: 'custom', name: 'Whole Milk', quantity: 1 }, item(-91000, 0), item(-91000, 1.5)]) {
    const result = compareOffers(mockStores, [item(-91001), missing]);
    assert.equal(result.baskets.length, 0);
    assert.equal(result.splitTotal, null);
    assert.equal(result.savings, null);
    assert.deepEqual(result.missingItems, [missing]);
  }
  assert.equal(compareOffers(mockStores, []).splitTotal, null);
});

test('invalid or more expensive coupons leave the ordinary price usable', () => {
  for (const price of [NaN, -1, 9]) {
    const result = compareOffers([{ ...mockStores[0], products: [{ productId: 1, price: 3, coupon: { price } }] }], [item(1)], true);
    assert.equal(result.splitTotal, 300);
    assert.equal(result.bestOffers[0].best.couponApplied, false);
  }
});

test('demo API serves mock prices without a database and validates ZIP searches', async () => {
  const query = async suffix => GET(new Request(`http://localhost/api/demo/stores${suffix}`));
  assert.equal((await (await query('?zip=11201&q=eggs')).json()).stores.length, 3);
  assert.deepEqual((await (await query('?zip=90210')).json()).stores, []);
  assert.equal((await query('?zip=bad')).status, 400);
  assert.equal((await query(`?q=${'x'.repeat(101)}`)).status, 400);
});
