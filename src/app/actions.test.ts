import { jest, describe, expect, it, beforeAll, beforeEach } from '@jest/globals';
import type { ManualGame, StoryIdentifier } from '@/types';

type MockFetch = jest.MockedFunction<typeof fetch>;

// Mock the fetch function
let mockFetch: MockFetch;

// Declare mockParseCsv with 'mock' prefix
let mockParseCsv: jest.Mock;
// No other module mocks are needed with the current implementation

// Mock only `parseCsv` and keep `sanitizeCsvField` behavior real.
jest.mock('@/lib/csv', () => {
  const actual = jest.requireActual('@/lib/csv') as typeof import('@/lib/csv');

  return {
    ...actual,
    parseCsv: jest.fn(),
  };
});

// Removed outdated mocks for '@/lib/stats' and the AI flow; the current actions
// implementation no longer uses those modules.

describe('generateWrappedData', () => {
  let generateWrappedData: (csvText: string) => Promise<StoryIdentifier>;

  beforeAll(() => {
    // Mock process.env before importing actions.ts
    process.env = { ...process.env, HOST_URL: 'test.vercel.app', NEXT_PUBLIC_API_PORT: '3000' };
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    jest.resetModules(); // Reset module registry to clear cached imports

    mockParseCsv = (jest.requireMock('@/lib/csv') as { parseCsv: jest.Mock }).parseCsv;

    mockFetch = jest.fn() as unknown as MockFetch;
    global.fetch = mockFetch;
    // Dynamically import generateWrappedData and parseCsv after mocking
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    generateWrappedData = require('./actions').generateWrappedData;
  });

  it('should generate wrapped data successfully', async () => {
    const mockCsvText = 'title,platform,rating,hours\ngame1,platform1,rating1,hours1\ngame2,platform2,rating2,hours2';
    const mockGames = [
      { title: 'game1', platform: 'platform1', rating: 'rating1', hours: 1 },
      { title: 'game2', platform: 'platform2', rating: 'rating2', hours: 2 },
    ];
    const mockId = 'test-id';

    mockParseCsv.mockReturnValue(mockGames);
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: mockId }),
    } as unknown as Response);

    const result = await generateWrappedData(mockCsvText);

    expect(mockParseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/generate'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ games: mockGames }),
      }
    );
    expect(result.id).toBe(mockId);
  });

  it('should throw an error if no valid game data is found', async () => {
    const mockCsvText = '';
    mockParseCsv.mockReturnValue([]);

    await expect(generateWrappedData(mockCsvText)).rejects.toThrow(
      'No valid game data found in the CSV. Please check the file format.'
    );
    expect(mockParseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should throw an error if API call fails', async () => {
    const mockCsvText = 'game1,platform1,rating1,hours1';
    const mockGames = [
      { name: 'game1', platform: 'platform1', rating: 'rating1', hours: 1 },
    ];
    const mockErrorData = { error: 'API error message' };

    mockParseCsv.mockReturnValue(mockGames);
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockErrorData),
    } as unknown as Response);

    await expect(generateWrappedData(mockCsvText)).rejects.toThrow(
      'Failed to generate your Rewind. API error message'
    );
    expect(mockParseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(mockFetch).toHaveBeenCalled();
  });
});

describe('generateWrappedDataFromManual', () => {
  let generateWrappedDataFromManual: (games: ManualGame[]) => Promise<StoryIdentifier>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockParseCsv = (jest.requireMock('@/lib/csv') as { parseCsv: jest.Mock }).parseCsv;

    mockFetch = jest.fn() as unknown as MockFetch;
    global.fetch = mockFetch;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    generateWrappedDataFromManual = require('./actions').generateWrappedDataFromManual;
  });

  it('should generate wrapped data from manual input successfully (posts to /api/generate via generateWrappedData)', async () => {
    const mockManualGames: ManualGame[] = [
      { id: '1', title: 'Game 1', platform: 'PC', status: 'Finished', score: '9' },
      { id: '2', title: 'Game 2', platform: 'PS5', status: 'Completed', score: '8' },
    ];
    const parsedGames = [
      { title: 'Game 1', platform: 'PC', score: 9, notes: 'Finished' },
      { title: 'Game 2', platform: 'PS5', score: 8, notes: 'Completed' },
    ];
    const mockId = 'abc-123';

    // parseCsv is called inside generateWrappedData with the CSV derived from manual games
    mockParseCsv.mockReturnValue(parsedGames as unknown as typeof parsedGames);
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ id: mockId }) } as unknown as Response);

    const result = await generateWrappedDataFromManual(mockManualGames);

    // Ensure we attempted to parse a CSV string with the expected header
    expect(mockParseCsv).toHaveBeenCalledTimes(1);
    expect(typeof mockParseCsv.mock.calls[0][0]).toBe('string');
    expect(String(mockParseCsv.mock.calls[0][0])).toContain('Title,Platform,Review Score,Review Notes');

    // The underlying generateWrappedData should post to /api/generate with the parsed games
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/generate'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games: parsedGames }),
      })
    );

    expect(result.id).toBe(mockId);
  });

  it('should throw an error if no games are provided', async () => {
    await expect(generateWrappedDataFromManual([])).rejects.toThrow(
      'No games provided. Please add some games to your list.'
    );
    // No calls made when validation fails
    expect(mockParseCsv).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
