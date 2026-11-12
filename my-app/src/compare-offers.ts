import type { DemoStore } from './demo-store';
import type { ShoppingItem } from './shopping-list';

export function compareOffers(stores: DemoStore[], items: ShoppingItem[], coupons = false) {
  const listings = stores.map(store => ({ store, lines: items.flatMap(item => {
    if (item.productId === undefined || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) return [];
    const offer = store.products?.find(product => product.productId === item.productId);
    if (!offer) return [];
    const useCoupon = coupons && offer.coupon && Number.isFinite(offer.coupon.price) && offer.coupon.price >= 0 && offer.coupon.price < offer.price;
    const price = useCoupon ? offer.coupon!.price : offer.price;
    if (!Number.isFinite(price) || price < 0) return [];
    return [{ item, offer, couponApplied: Boolean(useCoupon), cents: Math.round(price * 100) * item.quantity }];
  }) }));
  const baskets = listings.filter(basket => items.length > 0 && basket.lines.length === items.length)
    .map(basket => ({ ...basket, total: basket.lines.reduce((total, line) => total + line.cents, 0) }))
    .sort((a, b) => a.total - b.total || a.store.name.localeCompare(b.store.name));
  const bestOffers = items.map(item => ({ item, best: listings.flatMap(({ store, lines }) => {
    const line = lines.find(line => line.item.id === item.id);
    return line ? [{ store, ...line }] : [];
  }).sort((a, b) => a.cents - b.cents || a.store.name.localeCompare(b.store.name))[0] }));
  const missingItems = bestOffers.filter(line => !line.best).map(line => line.item);
  const splitTotal = items.length > 0 && missingItems.length === 0
    ? bestOffers.reduce((total, line) => total + line.best!.cents, 0) : null;
  const savings = splitTotal !== null && baskets.length ? baskets[0].total - splitTotal : null;
  return { baskets, bestOffers, missingItems, splitTotal, savings };
}
