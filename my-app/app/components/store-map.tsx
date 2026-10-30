'use client';

import { loadGoogleLibrary } from '@/src/google-maps';
import { useEffect, useRef, useState } from 'react';
import type { GroceryStore } from '@/src/demo-store';
import { dollars } from '@/src/demo-store';

type Props = { stores: GroceryStore[]; selectedId: string | number | null; onSelect: (id: string | number) => void; center?: google.maps.LatLngLiteral };
type MapEntry = { marker: google.maps.marker.AdvancedMarkerElement; element: HTMLButtonElement; popup: HTMLElement };
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

export default function StoreMap(props: Props) {
  if (!apiKey) return <div className="map-placeholder map-unavailable" role="status"><span className="map-empty-icon" aria-hidden="true">◎</span><h3>Google Maps is ready to connect</h3><p>Add your browser key as <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code>my-app/.env</code>, then restart the dev server.</p><small>Your demo stores are still available in the list.</small></div>;
  return <GoogleStoreMap {...props} />;
}

function GoogleStoreMap({ stores, selectedId, onSelect, center }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const popup = useRef<google.maps.InfoWindow | null>(null);
  const markers = useRef(new Map<string | number, MapEntry>());
  const select = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { select.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    let idleListener: google.maps.MapsEventListener | undefined;
    const entries = markers.current;
    const authWindow = window as Window & { gm_authFailure?: () => void };
    const previousAuthFailure = authWindow.gm_authFailure;
    const authFailure = () => {
      window.clearTimeout(timeout);
      if (!cancelled) setError('Google Maps rejected this key. Check its API access, allowed website URLs, billing, and demo restrictions.');
      previousAuthFailure?.();
    };
    authWindow.gm_authFailure = authFailure;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setError('Google Maps is taking too long to load. Check your connection or reload the page.');
    }, 20000);

    async function initialize() {
      try {
        const [mapsLibrary] = await Promise.all([loadGoogleLibrary('maps'), loadGoogleLibrary('marker')]);
        if (cancelled || !container.current) return;
        const { Map: GoogleMap, InfoWindow } = mapsLibrary as google.maps.MapsLibrary;
        const instance = new GoogleMap(container.current, {
          center: { lat: 40.694, lng: -73.986 }, zoom: 14,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          colorScheme: google.maps.ColorScheme.LIGHT,
          mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
          zoomControl: true, gestureHandling: 'greedy', clickableIcons: false,
        });
        map.current = instance;
        popup.current = new InfoWindow({ maxWidth: 260 });
        idleListener = google.maps.event.addListenerOnce(instance, 'idle', () => {
          window.clearTimeout(timeout);
          if (!cancelled) setReady(true);
        });
        observer = new ResizeObserver(() => google.maps.event.trigger(instance, 'resize'));
        observer.observe(container.current);
      } catch {
        window.clearTimeout(timeout);
        if (!cancelled) setError('Google Maps could not load. Check your connection and key configuration, then reload the page.');
      }
    }
    void initialize();
    return () => {
      cancelled = true; window.clearTimeout(timeout); observer?.disconnect(); idleListener?.remove();
      if (authWindow.gm_authFailure === authFailure) authWindow.gm_authFailure = previousAuthFailure;
      popup.current?.close(); popup.current = null;
      entries.forEach(({ marker }) => { marker.map = null; }); entries.clear();
      if (map.current) google.maps.event.clearInstanceListeners(map.current);
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !map.current) return;
    const entries = markers.current;
    popup.current?.close();
    entries.forEach(({ marker }) => { marker.map = null; }); entries.clear();
    const bounds = new google.maps.LatLngBounds();
    if (center) bounds.extend(center);
    stores.forEach((store, index) => {
      const position = { lat: store.latitude, lng: store.longitude }; bounds.extend(position);
      const element = document.createElement('button'); element.type = 'button'; element.className = 'google-store-pin';
      element.textContent = String(index + 1); element.setAttribute('aria-label', `Select ${store.name}`);
      element.addEventListener('click', () => select.current(store.id));
      const marker = new google.maps.marker.AdvancedMarkerElement({ map: map.current, position, title: store.name, content: element });
      const content = document.createElement('div'); content.className = 'store-popup';
      const title = document.createElement('strong'); title.textContent = store.name;
      const address = document.createElement('p'); address.textContent = store.address;
      const label = document.createElement('small'); label.textContent = store.source === 'google' ? 'Google Places · Prices unavailable' : 'Fictional demo location';
      content.append(title, address, label);
      if (store.source === 'demo') {
        for (const product of (store.products || []).slice(0, 3)) {
          const row = document.createElement('p'); row.textContent = `${product.name} (${product.size}): ${dollars(product.price)}`; content.append(row);
        }
        const note = document.createElement('small'); note.textContent = 'Fictional demo prices · Full inventory in store panel'; content.append(document.createElement('br'), note);
      }
      if (store.googleMapsURI?.startsWith('https://')) {
        const link = document.createElement('a'); link.href = store.googleMapsURI; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'View on Google Maps'; content.append(document.createElement('br'), link);
      }
      entries.set(store.id, { marker, element, popup: content });
    });
    if (stores.length) map.current.fitBounds(bounds, window.innerWidth > 640
      ? { left: 420, top: 110, right: 70, bottom: 50 }
      : { left: 25, top: 140, right: 25, bottom: 330 });
    else if (center) { map.current.setCenter(center); map.current.setZoom(14); }
    return () => { entries.forEach(({ marker }) => { marker.map = null; }); entries.clear(); };
  }, [stores, center, ready]);

  useEffect(() => {
    if (!ready) return;
    markers.current.forEach(({ marker, element }, id) => {
      element.classList.toggle('is-selected', id === selectedId);
      element.setAttribute('aria-pressed', String(id === selectedId));
      marker.zIndex = id === selectedId ? 1000 : 0;
    });
    const entry = selectedId !== null ? markers.current.get(selectedId) : undefined;
    if (entry && map.current && popup.current) {
      popup.current.setContent(entry.popup);
      popup.current.open({ map: map.current, anchor: entry.marker, shouldFocus: false });
      if (entry.marker.position) map.current.panTo(entry.marker.position as google.maps.LatLngLiteral);
    }
    else popup.current?.close();
  }, [selectedId, ready, stores, center]);

  return <div className="map-frame"><div ref={container} className="store-map" role="region" aria-label="Google Map of fictional grocery stores in Brooklyn" />{!ready && !error && <p className="map-notice" role="status">Loading Google Maps…</p>}{error && <div className="map-notice map-error" role="alert"><strong>Map unavailable</strong><p>{error}</p><small>You can still browse the store cards.</small></div>}</div>;
}
