'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShoppingList } from './use-shopping-list';
import ShoppingListPanel from './shopping-list-panel';
import { dollars, type DemoStore, type ProductOffer } from '@/src/demo-store';
import { compareOffers } from '@/src/compare-offers';

export default function StoreExplorer({ comparison = false, initialZip = '11201' }: { comparison?: boolean; initialZip?: string }) {
  const router = useRouter();
  const { items, addItem, removeItem, count } = useShoppingList();
  const [zip, setZip] = useState(initialZip);
  const [stores, setStores] = useState<DemoStore[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [query, setQuery] = useState('');
  const [weekly, setWeekly] = useState(false);
  const [coupons, setCoupons] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/demo/stores?zip=${encodeURIComponent(initialZip)}`, {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
        });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.stores)) throw new Error('Unable to load prices.');
        if (!controller.signal.aborted) { setStores(data.stores); setStatus('ready'); }
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    }
    void load();
    return () => controller.abort();
  }, [initialZip, retry]);

  const products = Array.from(new Map(stores.flatMap(store => store.products || []).map(product => [product.productId, product])).values());
  const visibleProducts = products.filter(product => `${product.name} ${product.category} ${product.size}`.toLowerCase().includes(query.toLowerCase().trim()));
  const unmatched = items.filter(item => item.productId === undefined);
  const { baskets, bestOffers, splitTotal, savings, missingItems } = compareOffers(stores, items, coupons);
  const searchHref = `/?zip=${encodeURIComponent(initialZip)}`;
  const readyToCompare = items.length > 0 && unmatched.length === 0 && status === 'ready';

  function addProduct(product: ProductOffer, quantity = 1, replaceId?: string) {
    try {
      addItem(product.name, quantity, { productId: product.productId, size: product.size });
      if (replaceId) removeItem(replaceId);
      setError('');
      setAnnouncement(`${product.name} added to your list.`);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to add item.'); }
  }

  return <main id="main-content">
    <section className={`hero ${comparison ? 'hero-compact' : ''}`}>
      <div>
        <p className="eyebrow"><span className="little-star" aria-hidden="true">✳</span> Good food. Thoughtful spending.</p>
        <h1>{comparison ? <>Your list.<br /><em>Your best price.</em></> : <>The weekly shop,<br /><em>a little smarter.</em></>}</h1>
        <p className="hero-description">{comparison ? 'One easy stop or a few extra savings. Find the shop that works for you.' : 'Make your list. Compare nearby stores. Keep a little more for the good stuff.'}</p>
        {!comparison && <a className="text-link" href="#shop">Let’s make your list <span aria-hidden="true">↘</span></a>}
      </div>
      {!comparison && <div className="market-note" aria-label="A little planning goes a long way">
        <span className="note-top">THE EVERYDAY ESSENTIALS</span>
        <div className="market-produce" aria-hidden="true"><span className="pear" /><span className="tomato"><i /></span><span className="orange" /></div>
        <p>A little planning.<br /><em>A fuller basket.</em></p>
        <span className="note-bottom">Made for your real-life grocery list.</span>
      </div>}
    </section>

    <div className="location-bar" id="shop">
      <form onSubmit={event => {
        event.preventDefault();
        if (!/^\d{5}$/.test(zip)) { setError('Enter a five-digit ZIP code.'); return; }
        setError('');
        if (zip === initialZip) { setStatus('loading'); setRetry(value => value + 1); }
        else router.push(`${comparison ? '/compare' : '/'}?zip=${encodeURIComponent(zip)}`, { scroll: false });
      }}>
        <label htmlFor="zip">Shopping near</label>
        <input id="zip" name="zip" aria-describedby="zip-hint" autoComplete="postal-code" value={zip} inputMode="numeric" pattern="[0-9]{5}" maxLength={5} required onChange={event => setZip(event.target.value)} />
        <button className="text-button" type="submit">Update ZIP <span aria-hidden="true">→</span></button>
      </form>
      <p id="zip-hint"><span className="demo-dot" /> Demo prices <span className="location-detail">· Try Brooklyn, 11201</span></p>
    </div>
    {error && <p className="notice error" role="alert">{error}</p>}
    <p className="sr-only" role="status">{announcement}</p>

    <div className="shop-layout">
      <div className="shop-main">
        <div className="section-heading"><div><p className="eyebrow">{comparison ? '02 / FIND YOUR FAVORITE' : '01 / BUILD YOUR BASKET'}</p><h2>{comparison ? 'A good deal, your way.' : 'What’s on your list?'}</h2></div>{comparison && <Link className="text-link" href={searchHref}>Edit list ↗</Link>}</div>
        {status === 'loading' && <div className="empty-state" role="status"><span className="loading-dot" /><h3>Checking the shelves…</h3><p>Finding listed products and prices in {initialZip}.</p></div>}
        {status === 'error' && <div className="empty-state" role="alert"><h3>We couldn’t get prices just yet.</h3><p>Your list is safe. Try again in a moment.</p><button onClick={() => { setStatus('loading'); setRetry(value => value + 1); }}>Try again</button></div>}

        {!comparison && <>
          <p className="section-description">Choose the product and size you usually buy. Or jot down an item in your list.</p>
          <label className="product-search"><span className="sr-only">Search listed products</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Find eggs, coffee, your everyday favorites…" value={query} onChange={event => setQuery(event.target.value)} /></label>
          {unmatched.length > 0 && <div className="matching-panel"><h3>One little detail…</h3><p>Choose a product and size for each item so we can compare like for like.</p>{unmatched.map(item => <label key={item.id}>{item.name}<select disabled={status !== 'ready' || !products.length} value="" onChange={event => {
            const product = products.find(product => product.productId === Number(event.target.value));
            if (product) addProduct(product, item.quantity, item.id);
          }}><option value="">Choose product & size</option>{products.map(product => <option key={product.productId} value={product.productId}>{product.name} · {product.size}</option>)}</select></label>)}</div>}
          {status === 'ready' && <>
            <p className="results-count">{visibleProducts.length} listed {visibleProducts.length === 1 ? 'essential' : 'essentials'} in {initialZip}</p>
            <div className="product-list">{visibleProducts.map(product => {
              const quantity = items.find(item => item.productId === product.productId)?.quantity;
              return <article className="product-row" key={product.productId}>
                <span className="product-monogram" aria-hidden="true">{product.name.slice(0, 1)}</span>
                <div className="product-info"><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.size}{quantity ? ` · ${quantity} in your list` : ''}</p></div>
                <button className="add-product" aria-label={`Add ${product.name}, ${product.size}`} onClick={() => addProduct(product)}><span aria-hidden="true">+</span> Add</button>
              </article>;
            })}</div>
            {!visibleProducts.length && <div className="empty-state"><h3>{products.length ? 'Nothing by that name yet.' : 'No listed products here yet.'}</h3><p>{products.length ? 'Try another search, or add a custom item to your list.' : 'Try another ZIP code. Your shopping list will stay with you.'}</p>{query && <button className="text-button" onClick={() => setQuery('')}>Clear search</button>}</div>}
          </>}
        </>}

        {comparison && <>
          <div className="comparison-switch" role="group" aria-label="How to compare"><button aria-pressed={!weekly} onClick={() => setWeekly(false)}>One store<span>Your whole list, one stop</span></button><button aria-pressed={weekly} onClick={() => setWeekly(true)}>Split & save<span>Best price for each item</span></button></div>
          <label className="coupon-toggle"><input type="checkbox" checked={coupons} onChange={event => setCoupons(event.target.checked)} /> Include prices that need a coupon</label>
          {status === 'ready' && (!items.length || unmatched.length > 0 ? <div className="empty-state"><h3>{items.length ? 'Let’s finish your list first.' : 'A great shop starts with a list.'}</h3><p>{items.length ? 'Choose an exact product and size for each item before comparing.' : 'Add a few essentials to find your best basket.'}</p><Link className="button" href={searchHref}>Build my list →</Link></div> : weekly ? <>
            <p className="section-description">These prices may mean visiting more than one store. Quantities are included in each total.</p>
            <div className="basket-card"><div className="basket-total"><h3>Split shopping total</h3><strong>{splitTotal === null ? 'Incomplete list' : dollars(splitTotal / 100)}</strong></div>
              {splitTotal === null ? <p>{missingItems.length} items have no available price. A complete total cannot be calculated.</p> : savings !== null && <p>Save {dollars(savings / 100)} compared with the cheapest complete one-store basket.</p>}
            </div>
            {bestOffers.map(({ item, best }) => <article className="weekly-row" key={item.id}><div><h3>{item.name}</h3><p>{item.quantity} × {item.size}</p>{best && <p>{best.store.name}</p>}{best?.couponApplied && best.offer.coupon && <small className="coupon-note">Coupon required{best.offer.coupon.code ? `: ${best.offer.coupon.code}` : ''}</small>}</div><strong className="line-total">{best ? dollars(best.cents / 100) : 'Unavailable'}</strong></article>)}
          </> : baskets.length ? baskets.slice(0, 3).map((basket, index) => <article className={`basket-card ${index === 0 ? 'best-basket' : ''}`} key={basket.store.id}>
            <div className="basket-heading"><span className="eyebrow">{index === 0 ? 'YOUR LOWEST COMPLETE BASKET' : 'ANOTHER GOOD OPTION'}</span><span>{items.length} / {items.length} listed items</span></div>
            <div className="basket-total"><div><h3>{basket.store.name}</h3><p>{basket.store.address}</p></div><div><strong>{dollars(basket.total / 100)}</strong><small>estimated total</small></div></div>
            <details open={index === 0}><summary>What’s in this basket</summary><ul>{basket.lines.map(line => <li key={line.item.id}><span>{line.item.quantity} × {line.item.name}<small>{line.item.size}{line.couponApplied && line.offer.coupon ? ` · Coupon required${line.offer.coupon.code ? `: ${line.offer.coupon.code}` : ''}` : ''}</small></span><strong>{dollars(line.cents / 100)}</strong></li>)}</ul></details>
          </article>) : <div className="empty-state"><h3>No single store has every listed item.</h3><p>Try “Split & save” for individual offers, or adjust your list or ZIP.</p><Link className="text-link" href={searchHref}>Edit my search →</Link></div>)}
          <p className="fine-print">Fictional demo prices. Estimates exclude tax and travel. A price listing does not guarantee stock.</p>
        </>}
      </div>
      <aside className="list-sidebar"><ShoppingListPanel />
        {!comparison && <div className="compare-action"><p>{unmatched.length ? `${unmatched.length} ${unmatched.length === 1 ? 'item needs' : 'items need'} a product match` : items.length ? 'Your next good deal starts here.' : 'Add your essentials to get started.'}</p>{readyToCompare ? <Link className="button" href={`/compare?zip=${encodeURIComponent(initialZip)}`}>Compare {count} {count === 1 ? 'item' : 'items'} <span aria-hidden="true">→</span></Link> : <button disabled>Compare prices →</button>}</div>}
      </aside>
    </div>
    <div className="page-note"><span aria-hidden="true">✳</span><p>A little less scrolling.<br /><strong>A little more saving.</strong></p><span>Plan here. Shop your way.</span></div>
  </main>;
}
