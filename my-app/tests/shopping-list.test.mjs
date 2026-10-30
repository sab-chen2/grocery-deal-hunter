import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addShoppingItem, setShoppingQuantity, parseShoppingList } from '../src/shopping-list.ts';

test('adds any grocery item without requiring a price or discount', () => {
  const result = addShoppingItem([], '  Apples  ', 3);
  assert.deepEqual(result, [{ id: 'custom:apples', name: 'Apples', quantity: 3 }]);
  assert.equal('price' in result[0], false);
});
test('duplicate custom names merge quantities regardless of case or whitespace', () => {
  const first = addShoppingItem([], 'Ground Coffee', 1);
  const merged = addShoppingItem(first, ' ground   COFFEE ', 2);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].quantity, 3);
  assert.equal(first[0].quantity, 1);
});
test('same product added from different stores merges without storing a stale price', () => {
  const product = { productId: -91001, size: '12 count' };
  const items = addShoppingItem(addShoppingItem([], 'Large Eggs', 1, product), 'Large Eggs', 1, product);
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 2);
  assert.equal(items[0].size, '12 count');
  assert.equal(items[0].productId, -91001);
});
test('different package products stay separate', () => {
  const first = addShoppingItem([], 'Eggs', 1, { productId: 1, size: '6 count' });
  assert.equal(addShoppingItem(first, 'Eggs', 1, { productId: 2, size: '12 count' }).length, 2);
});
test('quantity changes accept whole numbers from 1 to 999', () => {
  const items = addShoppingItem([], 'Milk');
  assert.equal(setShoppingQuantity(items, items[0].id, 4)[0].quantity, 4);
  for (const quantity of [0, -1, 1.5, NaN, 1000]) assert.equal(setShoppingQuantity(items, items[0].id, quantity), items);
  for (const quantity of [0, -1, 1.5, NaN, 1000]) assert.throws(() => addShoppingItem([], 'Milk', quantity), /whole number/);
});
test('blank items and quantity overflow cannot be added', () => {
  assert.throws(() => addShoppingItem([], '   '), /item name/);
  assert.throws(() => addShoppingItem([], 'x'.repeat(101)), /item name/);
  const items = addShoppingItem([], 'Rice', 999);
  assert.throws(() => addShoppingItem(items, 'Rice'), /999/);
});
test('saved lists round-trip and corrupt storage safely recovers', () => {
  const items = addShoppingItem(addShoppingItem([], 'Bread', 2), 'Eggs', 1, { productId: -91001, size: '12 count' });
  assert.deepEqual(parseShoppingList(JSON.stringify(items)), items);
  for (const serialized of [null, '', '{broken', '{}', 'null', '[null,1,"oops"]']) assert.deepEqual(parseShoppingList(serialized), []);
});
test('invalid saved quantities and duplicate IDs are filtered; extra stored fields are dropped', () => {
  const items = addShoppingItem([], 'Milk');
  const restored = parseShoppingList(JSON.stringify([{ ...items[0], price: 100 }, items[0], { ...items[0], id: 'bad', quantity: -2 }]));
  assert.deepEqual(restored, items);
});
