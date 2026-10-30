export type ShoppingItem = { id: string; name: string; quantity: number; productId?: number; size?: string };
export const SHOPPING_LIST_KEY = 'grocery-deal-hunter:shopping-list:v1';
export const MAX_QUANTITY = 999;

export function addShoppingItem(items: ShoppingItem[], name: string, quantity = 1, product?: { productId: number; size: string }): ShoppingItem[] {
  const cleaned = name.trim().replace(/\s+/g, ' ');
  if (!cleaned || cleaned.length > 100) throw new Error('Enter an item name between 1 and 100 characters.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) throw new Error('Quantity must be a whole number from 1 to 999.');
  const id = product ? `product:${product.productId}` : `custom:${cleaned.toLowerCase()}`;
  const existing = items.find((item) => item.id === id);
  if (existing && existing.quantity + quantity > MAX_QUANTITY) throw new Error('An item can have at most 999 units.');
  if (existing) return items.map((item) => item.id === id ? { ...item, quantity: item.quantity + quantity } : item);
  if (items.length >= 200) throw new Error('Your list is full. Remove an item before adding another.');
  return [...items, { id, name: cleaned, quantity, ...(product ? { productId: product.productId, size: product.size } : {}) }];
}

export function setShoppingQuantity(items: ShoppingItem[], id: string, quantity: number): ShoppingItem[] {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return items;
  return items.map((item) => item.id === id ? { ...item, quantity } : item);
}

export function parseShoppingList(serialized: string | null): ShoppingItem[] {
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!Array.isArray(parsed)) return [];
    const ids = new Set<string>();
    return parsed.filter((item): item is ShoppingItem => {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id || item.id.length > 150 || ids.has(item.id) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 100 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) return false;
      if (item.productId !== undefined && (!Number.isInteger(item.productId) || !Number.isFinite(item.productId))) return false;
      if (item.size !== undefined && (typeof item.size !== 'string' || item.size.length > 100)) return false;
      ids.add(item.id); return true;
    }).slice(0, 200).map(({ id, name, quantity, productId, size }) => ({ id, name: name.trim(), quantity, ...(productId !== undefined ? { productId } : {}), ...(size !== undefined ? { size } : {}) }));
  } catch { return []; }
}
