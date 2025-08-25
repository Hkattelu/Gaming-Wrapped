import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the lib functions used by the route
const mockSearch = jest.fn<Promise<string | null>, [string]>();
jest.mock('@/lib/igdb', () => ({
  searchCoverByTitle: (title: string) => mockSearch(title),
}));

describe('POST /api/igdb/cover', () => {
  beforeEach(() => {
    jest.resetModules();
    mockSearch.mockReset();
  });

  it('400 when body.title is missing/invalid', async () => {
    const { POST } = await import('./route');
    const res = await POST({ json: async () => ({ title: '    ' }) } as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Missing or invalid title' });
    expect(mockSearch).not.toHaveBeenCalled();
  });

  it('200 with { imageUrl } when resolver returns a URL', async () => {
    mockSearch.mockResolvedValue('https://images.igdb.com/igdb/image/upload/t_thumb/abc.jpg');
    const { POST } = await import('./route');
    const res = await POST({ json: async () => ({ title: 'Halo' }) } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/abc.jpg' });
  });

  it('200 with { imageUrl: null } when resolver throws (current behavior)', async () => {
    mockSearch.mockRejectedValue(new Error('upstream failed'));
    const { POST } = await import('./route');
    const res = await POST({ json: async () => ({ title: 'Halo' }) } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ imageUrl: null });
  });
});
