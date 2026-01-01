import { jest, describe, it, expect, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';

const createMockRequest = (url: string): NextRequest => {
  return new NextRequest(url);
};

type MockFetch = jest.MockedFunction<typeof fetch>;
const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('GET /api/backloggd', () => {
  it('returns 400 when username is missing', async () => {
    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/backloggd');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Username is required');
  });

  it('returns 400 when username contains invalid characters', async () => {
    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/backloggd?username=user/name');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Invalid username format');
  });

  it('returns 400 when username contains spaces', async () => {
    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/backloggd?username=user name');
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.text()).toContain('Invalid username format');
  });

  it('proceeds to fetch when username is valid (alphanumeric with dash/underscore/dot)', async () => {
    const mockFetch = jest.fn() as unknown as MockFetch;
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '<html><body></body></html>',
      json: async () => ({}),
    } as unknown as Response);

    global.fetch = mockFetch;

    const { GET } = await import('./route');
    const validUsername = 'valid.user-name_123';
    const req = createMockRequest(`http://localhost/api/backloggd?username=${validUsername}`);

    await GET(req);

    // Assert fetch was called with the correct URL, proving validation passed
    expect(mockFetch).toHaveBeenCalled();
    const calledUrl = String(mockFetch.mock.calls[0][0]);
    expect(calledUrl).toContain(`backloggd.com/u/${validUsername}`);
    expect(calledUrl).toContain('?page=1');
  });
});
