import { jest, describe, it, expect } from '@jest/globals';
import type { NextRequest } from 'next/server';

const createMockRequest = (url: string): NextRequest => ({
  url,
}) as unknown as NextRequest;

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

  it('proceeds when username is valid', async () => {
    // Mocking global fetch to avoid actual network call
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: false,
            status: 404,
            json: async () => ({}),
            text: async () => '',
        })
    ) as jest.Mock;

    const { GET } = await import('./route');
    const req = createMockRequest('http://localhost/api/backloggd?username=valid_user-123');
    const res = await GET(req);

    // Should not be the validation error
    if (res.status === 400) {
        expect(await res.text()).not.toContain('Invalid username format');
    }
  });
});
