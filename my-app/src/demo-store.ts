export type ProductOffer = {
  productId: number; name: string; brand: string; category: string; size: string;
  regularPrice: number; price: number; onSale: boolean; validUntil: string | null;
  coupon: { code: string | null; price: number } | null;
};
export type DemoStore = { id: number; name: string; address: string; latitude: number; longitude: number; zipCode?: string; products?: ProductOffer[] };

export type GroceryStore = Omit<DemoStore, 'id'> & {
  id: string | number;
  source: 'demo' | 'google';
  googleMapsURI?: string;
};

export function matchingProducts(store: GroceryStore, query: string) {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return (store.products || []).filter((product) => words.every((word) => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(word)));
}

export function matchesStore(store: GroceryStore, query: string) {
  const term = query.toLowerCase().trim();
  return !term || `${store.name} ${store.address}`.toLowerCase().includes(term) || matchingProducts(store, term).length > 0;
}

export const dollars = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
