'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { DemoStore, GroceryStore, ProductOffer } from '@/src/demo-store';
import { dollars, matchesStore, matchingProducts } from '@/src/demo-store';
import { searchNearbyGroceries } from '@/src/nearby-groceries';
import ShoppingListPanel from './shopping-list-panel';
import { useShoppingList } from './use-shopping-list';

const StoreMap = dynamic(() => import('./store-map'), {
  ssr: false, loading: () => <div className="map-placeholder" role="status">Loading Google Maps…</div>,
});

async function fetchDemoStores(signal?: AbortSignal, params = ''): Promise<GroceryStore[]> {
  const response = await fetch(`/api/demo/stores${params}`, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to load demo stores.');
  return data.stores.map((store: DemoStore) => ({ ...store, source: 'demo' }));
}

export default function StoreExplorer() {
  const [stores, setStores] = useState<GroceryStore[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [listOpen, setListOpen] = useState(true);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [listFeedback, setListFeedback] = useState('');
  const { addItem, count } = useShoppingList();
  const [mode, setMode] = useState<'demo' | 'google'>('demo');
  const [searchSource, setSearchSource] = useState<'demo' | 'google'>('demo');
  const [zip, setZip] = useState('11201');
  const [radius, setRadius] = useState(4828);
  const [area, setArea] = useState('Brooklyn, NY · 11201');
  const [center, setCenter] = useState<google.maps.LatLngLiteral>();
  const requestId = useRef(0);

  function openShoppingList() {
    setShoppingOpen(true);
    if (window.innerWidth < 1100) setListOpen(false);
  }

  function addProduct(product: ProductOffer) {
    try {
      addItem(product.name, 1, { productId: product.productId, size: product.size });
      setListFeedback(`${product.name} added to your shopping list.`);
      openShoppingList();
    } catch (failure) { setListFeedback(failure instanceof Error ? failure.message : 'Unable to add item.'); }
  }

  async function loadDemo() {
    const current = ++requestId.current;
    setMode('demo'); setSearchSource('demo'); setZip('11201'); setLoading(true); setError(''); setSelectedId(null); setSearch(''); setStores([]); setArea('Brooklyn, NY · 11201'); setCenter(undefined);
    try {
      const demoStores = await fetchDemoStores();
      if (current === requestId.current) setStores(demoStores);
    } catch (failure) {
      if (current === requestId.current) setError(failure instanceof Error ? failure.message : 'Unable to load stores.');
    } finally { if (current === requestId.current) setLoading(false); }
  }

  useEffect(() => {
    // Loading local demo records does not trigger Google Places requests.
    const controller = new AbortController();
    const current = ++requestId.current;
    const isCurrent = () => current === requestId.current && !controller.signal.aborted;
    const invalidate = () => { requestId.current++; };
    void fetchDemoStores(controller.signal).then((demoStores) => {
      if (isCurrent()) setStores(demoStores);
    }).catch((failure) => {
      if (isCurrent()) setError(failure instanceof Error ? failure.message : 'Unable to load demo stores.');
    }).finally(() => { if (isCurrent()) setLoading(false); });
    return () => { controller.abort(); invalidate(); };
  }, []);

  async function findStores(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{5}$/.test(zip.trim())) { setError('Enter a valid five-digit US ZIP code.'); return; }
    const current = ++requestId.current;
    setMode(searchSource); setLoading(true); setError(''); setSelectedId(null); setStores([]); setArea(`ZIP ${zip.trim()}`); setCenter(undefined);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        searchSource === 'google' ? searchNearbyGroceries(zip.trim(), radius) : (async () => {
          let location = { center: { lat: 40.6986772, lng: -73.9859414 }, label: 'Brooklyn, NY 11201' };
          if (zip.trim() !== '11201') {
            const response = await fetch(`/api/location?zip=${encodeURIComponent(zip.trim())}`);
            location = await response.json();
            if (!response.ok) throw new Error((location as unknown as { error: string }).error || 'ZIP lookup failed.');
          }
          const params = new URLSearchParams({ lat: String(location.center.lat), lng: String(location.center.lng), radius: String(radius) });
          return { stores: await fetchDemoStores(undefined, `?${params}`), ...location };
        })(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Search timed out. Check your connection and try again.')), 20000); }),
      ]);
      if (current !== requestId.current) return;
      setStores(result.stores); setCenter(result.center); setArea(result.label);
    } catch (failure) {
      if (current === requestId.current) setError(failure instanceof Error ? failure.message : 'Unable to search stores.');
    } finally {
      clearTimeout(timer);
      if (current === requestId.current) setLoading(false);
    }
  }

  const filtered = useMemo(() => stores.filter((store) => matchesStore(store, search)), [stores, search]);
  return <section className="map-workspace" aria-label="Explore grocery stores">
    <div className="map-canvas"><StoreMap stores={filtered} center={center} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setListOpen(true); }} /></div>
    <header className="map-header">
      <Link href="/" className="brand"><span className="brand-icon" aria-hidden="true">g.</span><span>Grocery Deal Hunter<small>Good finds, right around you.</small></span></Link>
      <div className="map-header-actions"><span className="map-area">{area}</span><button type="button" className="shopping-link" aria-expanded={shoppingOpen} aria-controls="map-shopping-list" onClick={() => shoppingOpen ? setShoppingOpen(false) : openShoppingList()}>My shopping list ({count})</button></div>
    </header>
    <button className="list-toggle" aria-expanded={listOpen} aria-controls="store-panel" onClick={() => { setListOpen(!listOpen); if (!listOpen && window.innerWidth < 1100) setShoppingOpen(false); }}>{listOpen ? 'Hide stores' : `Show stores (${stores.length})`}</button>
    <aside id="store-panel" className="floating-store-panel" aria-label="Grocery store results" hidden={!listOpen}>
      <div className="panel-intro">
        <p className="eyebrow">EXPLORE YOUR NEIGHBORHOOD</p><h1>Grocery stores</h1>
        <form className="zip-search" onSubmit={findStores}>
          <label htmlFor="search-source">Search in</label><select id="search-source" className="search-source" value={searchSource} onChange={(event) => setSearchSource(event.target.value as 'demo' | 'google')}><option value="demo">Demo stores &amp; prices</option><option value="google">Real stores on Google Maps</option></select>
          <label htmlFor="store-zip">US ZIP code</label>
          <div className="zip-search-fields"><input id="store-zip" inputMode="numeric" autoComplete="postal-code" placeholder="11201" maxLength={5} pattern="[0-9]{5}" required value={zip} onChange={(event) => setZip(event.target.value)} /><select aria-label="Search radius" value={radius} onChange={(event) => setRadius(Number(event.target.value))}><option value={1609}>1 mile</option><option value={4828}>3 miles</option><option value={8047}>5 miles</option></select></div>
          <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Find nearby stores'}</button>
        </form>
        <div className="data-source"><span>{mode === 'demo' ? 'Fictional demo stores' : 'Results from Google Maps'}</span><button type="button" disabled={loading && mode === 'demo'} onClick={() => void loadDemo()}>Use demo data</button></div>
        <label className="store-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search eggs, milk, stores or ZIP" aria-label="Search products, stores, addresses or ZIP codes" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <div className="result-summary" role="status"><strong>{loading ? 'Finding stores…' : `${filtered.length} of ${stores.length} stores`}</strong><span className="demo-pill">{mode === 'demo' ? 'Demo data' : 'Google Places'}</span></div>
      </div>
      <div className="panel-results" aria-busy={loading}>
        {error && <div role="alert" className="panel-message">{error}</div>}
        {!error && !loading && !filtered.length && <p className="panel-message">{stores.length ? mode === 'google' ? 'No matching stores. Google does not provide product prices; choose Demo stores & prices to search items.' : 'No matching items or stores. Try eggs, milk, bread or 11201.' : mode === 'google' ? 'No grocery stores found. Try a larger radius or another ZIP code.' : 'No demo stores within this radius. Try ZIP 11201 or a larger radius.'}</p>}
        {filtered.map((store, index) => {
          const offers = matchingProducts(store, search);
          const visibleOffers = offers.length ? offers : store.products || [];
          return <div key={store.id} className="store-result"><button className={`store-card ${selectedId === store.id ? 'is-selected' : ''}`} aria-pressed={selectedId === store.id} onClick={() => setSelectedId(store.id)}><span className="store-number">{index + 1}</span><span><strong>{store.name}</strong><span className="store-address">{store.address}</span>{store.source === 'google' ? <span className="price-unavailable">Prices unavailable</span> : <span className="inventory-count">{store.products?.length || 0} demo items · USD</span>}<span className="store-action">{selectedId === store.id ? 'Store selected' : 'View store & items'} ↗</span></span></button>
            {store.source === 'demo' && <div className="store-inventory" aria-label={`${store.name} demo prices`}>
              {(selectedId === store.id || search ? visibleOffers : visibleOffers.slice(0, 3)).map((product) => <div className="product-row" key={product.productId}><div><strong>{product.name}</strong><span>{product.size}</span>{product.coupon && <small>With coupon {product.coupon.code || 'required'}: {dollars(product.coupon.price)}</small>}<button type="button" className="product-add" onClick={() => addProduct(product)} aria-label={`Add ${product.name} to shopping list`}>+ Add to list</button></div><div className="product-price"><strong>{dollars(product.price)}</strong>{product.onSale && <><del>{dollars(product.regularPrice)}</del><small>Sale</small></>}</div></div>)}
              {!visibleOffers.length && <p className="inventory-empty">No current prices. Refresh the demo seed to renew offers.</p>}
              {selectedId !== store.id && !search && visibleOffers.length > 3 && <button className="inventory-more" onClick={() => setSelectedId(store.id)}>See all {visibleOffers.length} items</button>}
            </div>}
          </div>;
        })}
      </div>
      <p className="panel-disclaimer">{mode === 'demo' ? 'Fictional stores and prices. Demo inventory is near ZIP 11201.' : 'Google Maps · Up to 20 nearby results; not every store. Prices are not supplied by Google.'}</p>
    </aside>
    <p className="sr-only" role="status">{listFeedback}</p>
    {shoppingOpen && <aside id="map-shopping-list" className="floating-shopping-panel" aria-label="Shopping list"><ShoppingListPanel onClose={() => { setShoppingOpen(false); if (window.innerWidth < 1100) setListOpen(true); }} /><p className="shopping-product-feedback" role="status">{listFeedback}</p></aside>}
  </section>;
}
