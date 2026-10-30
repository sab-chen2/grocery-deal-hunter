'use client';

import { useSyncExternalStore } from 'react';
import { addShoppingItem, parseShoppingList, setShoppingQuantity, SHOPPING_LIST_KEY, type ShoppingItem } from '@/src/shopping-list';

const empty = { items: [] as ShoppingItem[], canSave: true };
let snapshot = empty;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage() {
  try { snapshot = { items: parseShoppingList(window.localStorage.getItem(SHOPPING_LIST_KEY)), canSave: true }; }
  catch { snapshot = { ...snapshot, canSave: false }; }
  loaded = true;
}
function getSnapshot() { if (!loaded) readStorage(); return snapshot; }
function getServerSnapshot() { return empty; }
function notify() { listeners.forEach((listener) => listener()); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key === SHOPPING_LIST_KEY || event.key === null) { readStorage(); notify(); }
  };
  window.addEventListener('storage', sync);
  return () => { listeners.delete(listener); window.removeEventListener('storage', sync); };
}
function update(change: (items: ShoppingItem[]) => ShoppingItem[]) {
  const items = change(getSnapshot().items);
  let canSave = true;
  try { window.localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(items)); }
  catch { canSave = false; }
  snapshot = { items, canSave }; notify();
}

export function useShoppingList() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...state,
    addItem: (name: string, quantity = 1, product?: { productId: number; size: string }) => update((items) => addShoppingItem(items, name, quantity, product)),
    setQuantity: (id: string, quantity: number) => update((items) => setShoppingQuantity(items, id, quantity)),
    removeItem: (id: string) => update((items) => items.filter((item) => item.id !== id)),
    count: state.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
