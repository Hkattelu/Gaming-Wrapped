import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import type { NextRequest } from 'next/server';

type GetGameDetails = (title: string) => Promise<{ url: string; slug: string } | null>;

const mockGetGameDetails = jest.fn<GetGameDetails>();

jest.mock('@/lib/igdb', () => ({
  getGameDetails: (title: string) => mockGetGameDetails(title),
}));

const createMockRequest = (body: Record<string, unknown>): NextRequest => ({
  json: async () => body,
}) as unknown as NextRequest;

describe('POST /api/igdb/game', () => {
  beforeEach(() => {
    mockGetGameDetails.mockReset();
  });

  it('returns url when game is found', async () => {
    mockGetGameDetails.mockResolvedValue({ url: 'https://www.igdb.com/games/halo', slug: 'halo' });

    const { POST } = await import('./route');
    const res = await POST(createMockRequest({ title: 'Halo' }));
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ url: 'https://www.igdb.com/games/halo', slug: 'halo' });
  });

  it('returns null url when game is not found', async () => {
    mockGetGameDetails.mockResolvedValue(null);

    const { POST } = await import('./route');
    const res = await POST(createMockRequest({ title: 'NonExistent' }));
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ url: null });
  });

  it('returns 400 when title is missing', async () => {
    const { POST } = await import('./route');
    const res = await POST(createMockRequest({}));
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({ error: 'Missing or invalid title' });
    expect(mockGetGameDetails).not.toHaveBeenCalled();
  });

  it('returns 400 when title is empty string', async () => {
    const { POST } = await import('./route');
    const res = await POST(createMockRequest({ title: '   ' }));
    
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({ error: 'Missing or invalid title' });
    expect(mockGetGameDetails).not.toHaveBeenCalled();
  });

  it('handles exceptions gracefully', async () => {
    mockGetGameDetails.mockRejectedValue(new Error('Network error'));

    const { POST } = await import('./route');
    const res = await POST(createMockRequest({ title: 'Halo' }));
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ url: null });
  });
});
