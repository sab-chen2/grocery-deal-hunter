export const runtime = 'nodejs';

type GeocodeResult = {
  location?: { latitude?: number; longitude?: number };
  formattedAddress?: string;
  postalAddress?: { postalCode?: string; regionCode?: string };
  addressComponents?: { types?: string[]; longText?: string; shortText?: string }[];
};

export async function GET(request: Request) {
  const zip = new URL(request.url).searchParams.get('zip')?.trim() || '';
  const headers = { 'Cache-Control': 'no-store' };
  if (!/^\d{5}$/.test(zip)) return Response.json({ error: 'Enter a valid five-digit US ZIP code.' }, { status: 400, headers });
  const key = process.env.GOOGLE_MAPS_GEOCODING_API_KEY?.trim() || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) return Response.json({ error: 'Google ZIP lookup is not configured. Add your demo key to the environment and restart the server.' }, { status: 503, headers });

  const url = new URL('https://geocode.googleapis.com/v4/geocode/address');
  url.searchParams.set('address.postalCode', zip);
  url.searchParams.set('address.regionCode', 'US');
  try {
    const response = await fetch(url, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'results.location,results.formattedAddress,results.postalAddress,results.addressComponents' },
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const error = response.status === 429
        ? 'Google ZIP lookup has reached its quota. Demo usage may resume tomorrow; you can use demo data now.'
        : response.status === 401 || response.status === 403
          ? 'Google Geocoding v4 rejected this key. Check demo-project API access and server-key restrictions. Billing has not been changed.'
          : 'Google ZIP lookup is unavailable. Try again shortly.';
      return Response.json({ error }, { status: response.status === 429 ? 429 : 502, headers });
    }
    const data: { results?: GeocodeResult[] } = await response.json();
    const result = data.results?.find((entry) => {
      // Postal-code results can omit postalAddress; v4 addressComponents still identify the ZIP and country.
      const country = entry.postalAddress?.regionCode || entry.addressComponents?.find((part) => part.types?.includes('country'))?.shortText;
      const postalCode = entry.postalAddress?.postalCode || entry.addressComponents?.find((part) => part.types?.includes('postal_code'))?.longText;
      return country === 'US' && postalCode?.split('-')[0] === zip;
    });
    const lat = result?.location?.latitude;
    const lng = result?.location?.longitude;
    if (!result || typeof lat !== 'number' || !Number.isFinite(lat) || typeof lng !== 'number' || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return Response.json({ error: 'That ZIP code could not be found. Try another US ZIP code.' }, { status: 404, headers });
    }
    return Response.json({ center: { lat, lng }, label: result.formattedAddress || `ZIP ${zip}` }, { headers });
  } catch {
    return Response.json({ error: 'Google ZIP lookup could not connect or timed out. Try again shortly.' }, { status: 503, headers });
  }
}
