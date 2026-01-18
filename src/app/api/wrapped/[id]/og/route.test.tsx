import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { WrappedData } from '@/types';

// Mock getWrapped
type GetWrapped = (id: string) => Promise<WrappedData | null>;
const mockGetWrapped = jest.fn<GetWrapped>();
jest.mock('@/lib/db', () => ({
  getWrapped: (id: string) => mockGetWrapped(id),
}));

// Mock ImageResponse
const mockImageResponse = jest.fn(() => new Response('Mock Image', { status: 200 }));
jest.mock('next/og', () => ({
  ImageResponse: mockImageResponse,
}));

describe('GET /api/wrapped/[id]/og', () => {
  const originalFetch = global.fetch;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.resetModules();
    mockGetWrapped.mockReset();
    mockImageResponse.mockClear();
    mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>();
    global.fetch = mockFetch;
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
        { type: 'summary', title: 'Summary', description: 'desc', totalGames: 10, averageScore: 8.5 },
        { type: 'player_persona', title: 'Persona', persona: 'The Loyal Legend', description: 'desc' },
        { type: 'top_game', title: 'Top game', description: 'desc', game: { title: 'Test Game', platform: 'PC', score: 10, notes: '' } },
        { type: 'genre_breakdown', title: 'Genres', description: 'desc', data: [] },
      ]
    });

    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    } as unknown as Response);

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
  });

  it('returns 200 image response when fonts fail', async () => {
    mockGetWrapped.mockResolvedValue({
      cards: [
        { type: 'summary', title: 'Summary', description: 'desc', totalGames: 10, averageScore: 8.5 },
        { type: 'player_persona', title: 'Persona', persona: 'The Loyal Legend', description: 'desc' },
        { type: 'top_game', title: 'Top game', description: 'desc', game: { title: 'Test Game', platform: 'PC', score: 10, notes: '' } },
        { type: 'genre_breakdown', title: 'Genres', description: 'desc', data: [] },
      ]
    });

    // Mock fetch to fail for fonts
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
    // You could spy on console.warn if you wanted to verify the warning
  });
  
  it('returns 200 image response when avatar fails', async () => {
     mockGetWrapped.mockResolvedValue({
      cards: [
        { type: 'summary', title: 'Summary', description: 'desc', totalGames: 10, averageScore: 8.5 },
        { type: 'player_persona', title: 'Persona', persona: 'The Loyal Legend', description: 'desc' },
        { type: 'top_game', title: 'Top game', description: 'desc', game: { title: 'Test Game', platform: 'PC', score: 10, notes: '' } },
        { type: 'genre_breakdown', title: 'Genres', description: 'desc', data: [] },
      ]
    });

    // Mock fetch to succeed for fonts but fail for avatar (simplified: just fail all)
    // Or we can mock implementation to check URL
    mockFetch.mockImplementation(async url => {
      const urlString = url.toString();
      if (urlString.includes('google/fonts')) {
        return {
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(8),
        } as unknown as Response;
      }
      if (urlString.includes('dicebear')) {
        return {
          ok: false,
        } as unknown as Response;
      }
      return { ok: false } as unknown as Response;
    });

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
  });
});
