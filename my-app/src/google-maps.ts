import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let configured = false;
export function loadGoogleLibrary(name: 'maps' | 'marker' | 'places') {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) throw new Error('Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to my-app/.env and restart the development server to search Google stores.');
  if (!configured) { setOptions({ key, v: 'weekly' }); configured = true; }
  return importLibrary(name);
}
