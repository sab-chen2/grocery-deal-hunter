import type { ProductOffer } from './demo-store';

type PriceRow = { productId: number; storeLocationId: number; regularPrice: number | null; salePrice: number | null; observedAt: string; validFrom: string | null; validUntil: string | null };
type ProductRow = { productId: number; name: string; brand: string; category: string; size: string | null; unit: string };
type DealRow = { productId: number; storeLocationId: number; couponRequired: boolean; couponCode: string | null; discountAmount: number | null; discountPercent: number | null; validFrom: string | null; validUntil: string | null };
export function currentOffers(locationId: number, products: ProductRow[], prices: PriceRow[], deals: DealRow[], now = Date.now()): ProductOffer[] {
  const active = (row: { validFrom: string | null; validUntil: string | null }) =>
    (!row.validFrom || Date.parse(row.validFrom) <= now) && (!row.validUntil || Date.parse(row.validUntil) > now);
  const cents = (value: number) => Math.round(value * 100);
  return products.flatMap((product) => {
    const price = prices.filter((row) => row.storeLocationId === locationId && row.productId === product.productId && active(row))
      .sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt))[0];
    if (!price || price.regularPrice === null || !Number.isFinite(price.regularPrice) || price.regularPrice < 0) return [];
    const regular = cents(price.regularPrice);
    const sale = price.salePrice !== null && Number.isFinite(price.salePrice) && price.salePrice >= 0 ? cents(price.salePrice) : regular;
    const effective = Math.min(regular, sale);
    const coupons = deals.filter((deal) => deal.storeLocationId === locationId && deal.productId === product.productId && deal.couponRequired && active(deal))
      .map((deal) => ({ code: deal.couponCode, price: Math.max(0, effective - (deal.discountAmount !== null ? cents(deal.discountAmount) : Math.round(effective * (deal.discountPercent || 0) / 100))) / 100 }))
      .sort((a, b) => a.price - b.price);
    return [{ productId: product.productId, name: product.name, brand: product.brand, category: product.category,
      size: `${product.size || '1'} ${product.unit}`, regularPrice: regular / 100, price: effective / 100,
      onSale: effective < regular, validUntil: price.validUntil, coupon: coupons[0] || null }];
  });
}

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radians = (value: number) => value * Math.PI / 180;
  const a = Math.sin(radians(lat2 - lat1) / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lng2 - lng1) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}
