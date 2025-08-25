import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock the lib function used by the route
const mockTop = jest.fn<Promise<Array<{ title: string; imageUrl: string | null }> | null>, [number, number]>();
jest.mock('@/lib/igdb', () => ({
  getTopGamesOfYear: (year: number, limit: number) => mockTop(year, limit),
}));

describe('GET /api/igdb/top-this-year', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    mockTop.mockReset();
  });

  it('200 with { suggestions } using the current UTC year', async () => {
    // Freeze time: Jan 1, 2025 UTC
    jest.setSystemTime(new Date(Date.UTC(2025, 0, 1, 0, 0, 0)));
    const suggestions = Array.from({ length: 3 }).map((_, i) => ({ title: `G${i + 1}`, imageUrl: null }));
    mockTop.mockResolvedValue(suggestions);

    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ suggestions });
    expect(mockTop).toHaveBeenCalledWith(2025, 8);
  });

  it('200 with { suggestions: [] } when resolver throws (current behavior)', async () => {
    jest.setSystemTime(new Date(Date.UTC(2025, 0, 1, 0, 0, 0)));
    mockTop.mockRejectedValue(new Error('boom'));
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ suggestions: [] });
  });
});
