import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../app/api/location/route.ts';

test('ZIP lookup uses Geocoding v4 and handles demo-key responses', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalPublic = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const originalServer = process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-public-key';
  delete process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
  const request = (zip) => new Request(`http://localhost/api/location?zip=${zip}`);
  const result = { location: { latitude: 40.698, longitude: -73.985 }, formattedAddress: 'Brooklyn, NY 11201, USA',
    addressComponents: [{ types: ['postal_code'], longText: '11201' }, { types: ['country'], shortText: 'US' }] };
  try {
    await t.test('rejects invalid ZIP without calling Google', async () => {
      globalThis.fetch = () => { throw new Error('Unexpected external request'); };
      assert.equal((await GET(request('invalid'))).status, 400);
    });
    await t.test('accepts real v4 ZIP response without postalAddress', async () => {
      globalThis.fetch = async (url, options) => {
        assert.equal(url.origin, 'https://geocode.googleapis.com');
        assert.equal(url.pathname, '/v4/geocode/address');
        assert.equal(url.searchParams.get('address.postalCode'), '11201');
        assert.equal(url.searchParams.get('address.regionCode'), 'US');
        assert.equal(options.headers['X-Goog-Api-Key'], 'test-public-key');
        assert.equal(options.cache, 'no-store');
        return Response.json({ results: [result] });
      };
      const response = await GET(request('11201'));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Cache-Control'), 'no-store');
      assert.deepEqual(await response.json(), { center: { lat: 40.698, lng: -73.985 }, label: result.formattedAddress });
    });
    await t.test('rejects wrong country and unmatched ZIP', async () => {
      for (const changed of [{ ...result, addressComponents: [{ types: ['country'], shortText: 'CA' }] },
        { ...result, postalAddress: { regionCode: 'US', postalCode: '10001' } }]) {
        globalThis.fetch = async () => Response.json({ results: [changed] });
        assert.equal((await GET(request('11201'))).status, 404);
      }
    });
    await t.test('handles no results and missing coordinates', async () => {
      for (const results of [[], [{ ...result, location: undefined }]]) {
        globalThis.fetch = async () => Response.json({ results });
        assert.equal((await GET(request('11201'))).status, 404);
      }
    });
    await t.test('reports quota and permission failures without leaking upstream data', async () => {
      for (const status of [429, 403]) {
        globalThis.fetch = async () => Response.json({ error: { message: 'private upstream details' } }, { status });
        const response = await GET(request('11201'));
        assert.equal(response.status, status === 429 ? 429 : 502);
        assert.doesNotMatch(JSON.stringify(await response.json()), /private upstream details|test-public-key/);
      }
    });
    await t.test('handles network failure', async () => {
      globalThis.fetch = async () => { throw new Error('network failure'); };
      assert.equal((await GET(request('11201'))).status, 503);
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalPublic === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    else process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = originalPublic;
    if (originalServer === undefined) delete process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
    else process.env.GOOGLE_MAPS_GEOCODING_API_KEY = originalServer;
  }
});
