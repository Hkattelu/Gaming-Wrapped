import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import type { WrappedData } from '@/types';

type GetWrapped = (id: string) => Promise<WrappedData | null>;
const mockGetWrapped = jest.fn<GetWrapped>();
jest.mock('@/lib/db', () => ({
  getWrapped: (id: string) => mockGetWrapped(id),
}));

const mockImageResponse = jest.fn((..._args: unknown[]) => new Response('Mock Image', { status: 200 }));
jest.mock('next/og', () => ({
  ImageResponse: mockImageResponse,
}));

describe('GET /api/wrapped/[id]/og', () => {
  const originalFetch = global.fetch;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  const createWrappedData = (): WrappedData => ({
    cards: [
      { type: 'summary', title: 'Summary', description: 'desc', totalGames: 10, averageScore: 8.5 },
    ],
  });

  beforeEach(() => {
    jest.resetModules();
    mockGetWrapped.mockReset();
    mockImageResponse.mockClear();
    mockFetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const createMockRequest = (url: string) => {
    return new NextRequest(new URL(url, 'http://localhost'));
  };

  const getImageResponseOptions = () => {
    expect(mockImageResponse).toHaveBeenCalled();

    const options = mockImageResponse.mock.calls[0]?.[1] as
      | { width?: number; height?: number; fonts?: unknown }
      | undefined;

    expect(options).toBeDefined();
    return options as { width?: number; height?: number; fonts?: unknown };
  };

  it('returns 404 if wrapped data not found', async () => {
    mockGetWrapped.mockResolvedValue(null);

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), {
      params: Promise.resolve({ id: '123' }),
    });

    expect(res.status).toBe(404);
    expect(mockImageResponse).not.toHaveBeenCalled();
  });

  it('returns 200 image response when everything succeeds', async () => {
    mockGetWrapped.mockResolvedValue(createWrappedData());

    mockFetch.mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('raw.githubusercontent.com/google/fonts')) {
        return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
      }
      if (url.includes('api.dicebear.com')) {
        return new Response(new Uint8Array([4, 5, 6]), { status: 200 });
      }

      return new Response(null, { status: 404 });
    });

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), {
      params: Promise.resolve({ id: '123' }),
    });

    expect(res.status).toBe(200);

    expect(mockImageResponse).toHaveBeenCalledTimes(1);
    const options = getImageResponseOptions();
    expect(options.width).toBe(1200);
    expect(options.height).toBe(630);
    expect(Array.isArray(options.fonts)).toBe(true);
    expect((options.fonts as unknown[]).length).toBe(2);
  });

  it('returns 200 image response when fonts fail', async () => {
    mockGetWrapped.mockResolvedValue(createWrappedData());

    mockFetch.mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('raw.githubusercontent.com/google/fonts')) {
        return new Response(null, { status: 404 });
      }
      if (url.includes('api.dicebear.com')) {
        return new Response(new Uint8Array([4, 5, 6]), { status: 200 });
      }

      return new Response(null, { status: 404 });
    });

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), {
      params: Promise.resolve({ id: '123' }),
    });

    expect(res.status).toBe(200);

    expect(mockImageResponse).toHaveBeenCalledTimes(1);
    const options = getImageResponseOptions();
    expect(options.fonts).toBeUndefined();
  });

  it('returns 200 image response when avatar fails', async () => {
    mockGetWrapped.mockResolvedValue(createWrappedData());

    mockFetch.mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes('raw.githubusercontent.com/google/fonts')) {
        return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
      }
      if (url.includes('api.dicebear.com')) {
        return new Response(null, { status: 404 });
      }

      return new Response(null, { status: 404 });
    });

    const { GET } = await import('./route');
    const res = await GET(createMockRequest('http://localhost/api/wrapped/123/og'), {
      params: Promise.resolve({ id: '123' }),
    });

    expect(res.status).toBe(200);

    expect(mockImageResponse).toHaveBeenCalledTimes(1);
    const options = getImageResponseOptions();
    expect(Array.isArray(options.fonts)).toBe(true);
    expect((options.fonts as unknown[]).length).toBe(2);
  });
});
