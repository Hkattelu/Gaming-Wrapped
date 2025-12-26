import { jest, describe, it, expect, afterEach, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const createMockRequest = (url: string): NextRequest => {
    // In our mock, NextRequest constructor takes the url
    return new NextRequest(url);
};

// Mock environment variables
process.env.STEAM_API_KEY = 'mock_key';

type MockFetch = jest.MockedFunction<typeof fetch>;
let previousFetch: typeof fetch | undefined;

beforeEach(() => {
  previousFetch = global.fetch;
});

afterEach(() => {
  if (typeof previousFetch === 'undefined') {
    // @ts-expect-error - allow removing the global property if it was missing originally
    delete global.fetch;
  } else {
    global.fetch = previousFetch;
  }
});

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

  it('proceeds to fetch when steamId is valid 17-digit number', async () => {
    const mockFetch = jest.fn() as unknown as MockFetch;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ response: { games: [] } }),
    } as unknown as Response);

    global.fetch = mockFetch;

    const { GET } = await import('./route');
    const validSteamId = '76561198006409530';
    const req = createMockRequest(`http://localhost/api/steam?steamId=${validSteamId}`);

    const res = await GET(req);

    // Assert fetch was called with the correct ID, proving validation passed
    expect(mockFetch).toHaveBeenCalled();
    const calledUrl = String(mockFetch.mock.calls[0][0]);
    expect(calledUrl).toContain(validSteamId);
    expect(calledUrl).toContain('api.steampowered.com');
  });
});
