import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareOffers } from '../src/compare-offers.ts';

const item = (productId, quantity = 1) => ({ id: `product:${productId}`, productId, name: `Item ${productId}`, quantity });
const offer = (productId, price, coupon = null) => ({ productId, price, coupon });
const store = (name, products) => ({ id: name, name, products });

test('only complete baskets qualify, quantities use cents, ties sort by name', () => {
  const stores = [store('Zed', [offer(1, 1.15), offer(2, 2)]), store('Partial', [offer(1, 0.1)]), store('Alpha', [offer(1, 1.15), offer(2, 2)])];
  const result = compareOffers(stores, [item(1, 3), item(2)]);
  assert.deepEqual(result.baskets.map(basket => [basket.store.name, basket.total]), [['Alpha', 545], ['Zed', 545]]);
});

test('split shopping works without any complete basket and preserves missing offers', () => {
  const result = compareOffers([store('A', [offer(1, 3)]), store('B', [offer(2, 2)])], [item(1, 2), item(2), item(3)]);
  assert.equal(result.baskets.length, 0);
  assert.equal(result.bestOffers[0].best.cents, 600);
  assert.equal(result.bestOffers[1].best.store.name, 'B');
  assert.equal(result.bestOffers[2].best, undefined);
});

test('coupons are opt-in and affect both basket and per-item totals', () => {
  const stores = [store('A', [offer(1, 3, { price: 1, code: 'SAVE' })]), store('B', [offer(1, 2)])];
  assert.equal(compareOffers(stores, [item(1, 2)]).baskets[0].store.name, 'B');
  const result = compareOffers(stores, [item(1, 2)], true);
  assert.equal(result.baskets[0].total, 200);
  assert.equal(result.bestOffers[0].best.store.name, 'A');
});

test('empty, custom and invalid-priced items never create a complete basket', () => {
  const stores = [store('A', [offer(1, NaN), offer(2, -1)])];
  assert.deepEqual(compareOffers(stores, []).baskets, []);
  assert.deepEqual(compareOffers(stores, [{ id: 'custom:milk', name: 'Milk', quantity: 1 }]).baskets, []);
  assert.equal(compareOffers(stores, [item(1)]).bestOffers[0].best, undefined);
  assert.equal(compareOffers(stores, [item(2)]).baskets.length, 0);
});
