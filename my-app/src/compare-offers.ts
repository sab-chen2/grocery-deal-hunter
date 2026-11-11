import type { DemoStore } from './demo-store';
import type { ShoppingItem } from './shopping-list';

export function compareOffers(stores: DemoStore[], items: ShoppingItem[], coupons = false) {
  const listings = stores.map(store => ({ store, lines: items.flatMap(item => {
    const offer = store.products?.find(product => product.productId === item.productId);
    if (!offer) return [];
    const price = coupons && offer.coupon ? offer.coupon.price : offer.price;
    if (!Number.isFinite(price) || price < 0) return [];
    return [{ item, offer, cents: Math.round(price * 100) * item.quantity }];
  }) }));
  const baskets = listings.filter(basket => items.length > 0 && basket.lines.length === items.length)
    .map(basket => ({ ...basket, total: basket.lines.reduce((total, line) => total + line.cents, 0) }))
    .sort((a, b) => a.total - b.total || a.store.name.localeCompare(b.store.name));
  const bestOffers = items.map(item => ({ item, best: listings.flatMap(({ store, lines }) => {
    const line = lines.find(line => line.item.id === item.id);
    return line ? [{ store, ...line }] : [];
  }).sort((a, b) => a.cents - b.cents || a.store.name.localeCompare(b.store.name))[0] }));
  return { baskets, bestOffers };
}
