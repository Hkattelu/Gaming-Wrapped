import { jest, describe, it, expect } from '@jest/globals';
import type { NextRequest } from 'next/server';

const createMockRequest = (url: string): NextRequest => ({
  url,
}) as unknown as NextRequest;

// Mock environment variables
process.env.STEAM_API_KEY = 'mock_key';

describe('GET /api/steam', () => {
  it('returns 400 when steamId is missing', async () => {
    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/steam');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Steam ID is required');
  });

  it('returns 400 when steamId is invalid format', async () => {
    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/steam?steamId=invalid123');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Invalid Steam ID');
  });

  it('proceeds when steamId is valid 17-digit number', async () => {
    // We expect it to try to fetch (or fail later) but pass validation
    // Mocking global fetch to avoid actual network call
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: false,
            status: 404, // Simulating a not found or just checking it reached this point
            json: async () => ({}),
        })
    ) as jest.Mock;

    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/steam?steamId=76561198006409530');
    const res = await GET(req);

    // It should not be 400 'Invalid Steam ID'
    // It might return 404 because our mock fetch returns 404, or 500 etc.
    // The key is it shouldn't be the validation error.
    if (res.status === 400) {
        expect(await res.text()).not.toContain('Invalid Steam ID');
    }
  });
});
