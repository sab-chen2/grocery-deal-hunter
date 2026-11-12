import { mockStores } from '../../../../src/mock-stores.ts';
import { matchesStore } from '../../../../src/demo-store.ts';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get('q') || '').trim();
  const zip = params.get('zip');
  if (query.length > 100 || (zip && !/^\d{5}$/.test(zip))) {
    return Response.json({ error: 'Provide a valid search and five-digit ZIP code.' }, { status: 400 });
  }
  const stores = mockStores.filter(store => (!zip || store.zipCode === zip) && matchesStore(store, query))
    .sort((a, b) => a.name.localeCompare(b.name));
  return Response.json({ stores }, { headers: { 'Cache-Control': 'no-store' } });
}
