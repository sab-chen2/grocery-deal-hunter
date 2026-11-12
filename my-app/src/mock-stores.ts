import data from './mock-data.json' with { type: 'json' };
import { currentOffers } from './demo-pricing.ts';
import type { GroceryStore } from './demo-store';

// Static demo offers have no expiry; database seeding applies real validity dates.
const prices = data.products.flatMap(product => product.prices.map((regularPrice, index) => {
  const storeLocationId = data.stores[index].id;
  const deal = data.deals.find(deal => deal.productId === product.productId && deal.storeLocationId === storeLocationId);
  return { productId: product.productId, storeLocationId, regularPrice,
    salePrice: deal && !deal.couponRequired ? regularPrice - deal.discountAmount : null,
    observedAt: '2026-01-01T00:00:00Z', validFrom: null, validUntil: null };
}));
const deals = data.deals.map(deal => ({ ...deal, discountPercent: null, validFrom: null, validUntil: null }));

export const mockStores: GroceryStore[] = data.stores.map(store => ({
  ...store, source: 'demo', address: `${store.address}, Brooklyn, NY ${store.zipCode}`,
  products: currentOffers(store.id, data.products, prices, deals),
}));
