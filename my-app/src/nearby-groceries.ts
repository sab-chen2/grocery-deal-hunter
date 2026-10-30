import { loadGoogleLibrary } from './google-maps';
import type { GroceryStore } from './demo-store';

export async function searchNearbyGroceries(zip: string, radius: number) {
  if (!/^\d{5}$/.test(zip)) throw new Error('Enter a valid five-digit US ZIP code.');
  if (![1609, 4828, 8047].includes(radius)) throw new Error('Choose a supported search radius.');
  const response = await fetch(`/api/location?zip=${encodeURIComponent(zip)}`);
  const location = await response.json();
  if (!response.ok) throw new Error(location.error || 'ZIP lookup failed. Try again.');
  const center: google.maps.LatLngLiteral = location.center;
  const placesLibrary = await loadGoogleLibrary('places') as google.maps.PlacesLibrary;
  try {
    const { places } = await placesLibrary.Place.searchNearby({
      fields: ['id', 'displayName', 'formattedAddress', 'location', 'googleMapsURI'],
      locationRestriction: { center, radius },
      includedTypes: ['grocery_store', 'supermarket'],
      maxResultCount: 20,
      rankPreference: placesLibrary.SearchNearbyRankPreference.DISTANCE,
    });
    const unique = new Map<string, GroceryStore>();
    for (const place of places) {
      if (!place.location || !place.id) continue;
      unique.set(place.id, { id: place.id, name: place.displayName || 'Grocery store',
        address: place.formattedAddress || 'Address unavailable', latitude: place.location.lat(), longitude: place.location.lng(),
        source: 'google', googleMapsURI: place.googleMapsURI || undefined });
    }
    return { stores: [...unique.values()], center, label: location.label as string };
  } catch {
    throw new Error('Store search failed. Check Places API (New) access, key restrictions, or the demo daily quota. You can use demo data while resolving this.');
  }
}
