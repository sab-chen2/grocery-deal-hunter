export const runtime = 'nodejs';
import { currentOffers, distanceMeters } from '@/src/demo-pricing';
import { matchesStore } from '@/src/demo-store';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get('q') || '').trim();
  const zip = params.get('zip');
  const lat = Number(params.get('lat')); const lng = Number(params.get('lng')); const radius = Number(params.get('radius') || '4828');
  const nearby = params.has('lat') || params.has('lng');
  if (query.length > 100 || (zip && !/^\d{5}$/.test(zip)) || (nearby && (!params.has('lat') || !params.has('lng') || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || ![1609, 4828, 8047].includes(radius)))) {
    return Response.json({ error: 'Provide a valid search, ZIP code, and supported radius.' }, { status: 400 });
  }
  try {
    const { db } = await import('@/src/prisma/db');
    const [stores, locations, products, prices, deals] = await Promise.all([
      db.orm.public.Store.where({ websiteUrl: 'https://grocery-demo.example' }).all(),
      db.orm.public.StoreLocation.where({ addressLine2: 'FICTIONAL DEMO LOCATION' }).all(),
      db.orm.public.Product.where({ brand: 'Demo Pantry' }).all(),
      db.orm.public.Price.where({ source: 'fictional-demo-v1' }).all(),
      db.orm.public.Deal.where({ source: 'fictional-demo-v1' }).all(),
    ]);
    const numericPrices = prices.map((price) => ({ ...price, regularPrice: price.regularPrice === null ? null : Number(price.regularPrice), salePrice: price.salePrice === null ? null : Number(price.salePrice) }));
    const numericDeals = deals.map((deal) => ({ ...deal, discountAmount: deal.discountAmount === null ? null : Number(deal.discountAmount), discountPercent: deal.discountPercent === null ? null : Number(deal.discountPercent) }));
    const names = new Map(stores.map((store) => [store.storeId, store.name]));
    const result = locations.filter((location) => names.has(location.storeId) && location.latitude !== null && location.longitude !== null).map((location) => ({
      id: location.storeLocationId, name: names.get(location.storeId)!,
      address: `${location.addressLine1}, ${location.city}, ${location.state} ${location.zipCode}`,
      latitude: location.latitude!, longitude: location.longitude!, zipCode: location.zipCode,
      source: 'demo' as const,
      products: currentOffers(location.storeLocationId, products, numericPrices, numericDeals),
    })).filter((store) => matchesStore(store, query) && (nearby ? distanceMeters(lat, lng, store.latitude, store.longitude) <= radius : !zip || store.zipCode === zip))
      .sort((a, b) => a.name.localeCompare(b.name));
    return Response.json({ stores: result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Unable to load demo stores. Check your local database connection.' }, { status: 503 });
  }
}
