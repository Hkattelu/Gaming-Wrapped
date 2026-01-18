import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';

// Mock getWrapped
const mockGetWrapped = jest.fn();
jest.mock('@/lib/db', () => ({
  getWrapped: (id: string) => mockGetWrapped(id),
}));

// Mock ImageResponse
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation((element: any, options: any) => {
    // Return a simple Response mock
    return new Response('Mock Image', { status: 200 });
  }),
}));

describe('GET /api/wrapped/[id]/og', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockGetWrapped.mockReset();
    global.fetch = jest.fn() as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'http://localhost'));
  };

  it('returns 404 if wrapped data not found', async () => {
    mockGetWrapped.mockResolvedValue(null);
    
    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(404);
  });

  it('returns 200 image response when everything succeeds', async () => {
    mockGetWrapped.mockResolvedValue({
      cards: [
        { type: 'summary', totalGames: 10, averageScore: 8.5 },
        { type: 'player_persona', persona: 'The Loyal Legend' },
        { type: 'top_game', game: { title: 'Test Game', score: 10 } },
        { type: 'genre_breakdown', data: [] },
      ]
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as any);

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
  });

  it('returns 200 image response when fonts fail', async () => {
    mockGetWrapped.mockResolvedValue({
      cards: [
        { type: 'summary', totalGames: 10, averageScore: 8.5 },
        { type: 'player_persona', persona: 'The Loyal Legend' },
        { type: 'top_game', game: { title: 'Test Game', score: 10 } },
        { type: 'genre_breakdown', data: [] },
      ]
    });

    // Mock fetch to fail for fonts
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    } as any);

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
    // You could spy on console.warn if you wanted to verify the warning
  });
  
  it('returns 200 image response when avatar fails', async () => {
     mockGetWrapped.mockResolvedValue({
      cards: [
        { type: 'summary', totalGames: 10, averageScore: 8.5 },
        { type: 'player_persona', persona: 'The Loyal Legend' },
        { type: 'top_game', game: { title: 'Test Game', score: 10 } },
        { type: 'genre_breakdown', data: [] },
      ]
    });

    // Mock fetch to succeed for fonts but fail for avatar (simplified: just fail all)
    // Or we can mock implementation to check URL
    (global.fetch as jest.Mock).mockImplementation(async (url: any) => {
        const urlString = url.toString();
        if (urlString.includes('google/fonts')) {
             return {
                 ok: true,
                 arrayBuffer: async () => new ArrayBuffer(8),
             };
        }
        if (urlString.includes('dicebear')) {
             return {
                 ok: false,
             };
        }
        return { ok: false };
    });

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
  });
});
