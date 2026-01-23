import { jest, describe, expect, it, beforeAll, beforeEach } from '@jest/globals';
import type { ManualGame } from '@/types';

// Mock the fetch function
global.fetch = jest.fn() as unknown as typeof fetch;

// Declare mockParseCsv with 'mock' prefix
let mockParseCsv: jest.Mock;
// No other module mocks are needed with the current implementation

// Mock the csv module, referencing mockParseCsv
jest.mock('@/lib/csv', () => ({
  parseCsv: jest.fn((csvText: string) => mockParseCsv(csvText)), // Reference the prefixed variable
}));

// Removed outdated mocks for '@/lib/stats' and the AI flow; the current actions
// implementation no longer uses those modules.

describe('generateWrappedData', () => {
  let generateWrappedData: (csvText: string) => Promise<{ id: string }>;

  beforeAll(() => {
    // Mock process.env before importing actions.ts
    process.env = { ...process.env, HOST_URL: 'test.vercel.app', NEXT_PUBLIC_API_PORT: '3000' };
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    jest.resetModules(); // Reset module registry to clear cached imports

    mockParseCsv = (jest.requireMock('@/lib/csv') as { parseCsv: jest.Mock }).parseCsv;
    // Dynamically import generateWrappedData and parseCsv after mocking
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    generateWrappedData = require('./actions').generateWrappedData;

    global.fetch = jest.fn() as unknown as typeof fetch; // Re-assign fetch to a new mock for each test
  });

  it('should generate wrapped data successfully', async () => {
    const mockCsvText = 'title,platform,rating,hours\ngame1,platform1,rating1,hours1\ngame2,platform2,rating2,hours2';
    const mockGames = [
      { title: 'game1', platform: 'platform1', rating: 'rating1', hours: 1 },
      { title: 'game2', platform: 'platform2', rating: 'rating2', hours: 2 },
    ];
    const mockId = 'test-id';

    mockParseCsv.mockReturnValue(mockGames);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: mockId }),
    });

    const result = await generateWrappedData(mockCsvText);

    expect(mockParseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/generate'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ games: mockGames }),
      }
    );
    expect(result).toEqual({
      id: mockId,
    });
  });

  it('should throw an error if no valid game data is found', async () => {
    const mockCsvText = '';
    mockParseCsv.mockReturnValue([]);

    await expect(generateWrappedData(mockCsvText)).rejects.toThrow(
      'No valid game data found in the CSV. Please check the file format.'
    );
    expect(mockParseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should throw an error if API call fails', async () => {
    const mockCsvText = 'game1,platform1,rating1,hours1';
    const mockGames = [
      { name: 'game1', platform: 'platform1', rating: 'rating1', hours: 1 },
    ];
    const mockErrorData = { error: 'API error message' };

    mockParseCsv.mockReturnValue(mockGames);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockErrorData),
    });

    await expect(generateWrappedData(mockCsvText)).rejects.toThrow(
      'Failed to generate your Rewind. API error message'
    );
    expect(mockParseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(global.fetch).toHaveBeenCalled();
  });
});

describe('generateWrappedDataFromManual', () => {
  let generateWrappedDataFromManual: (games: ManualGame[]) => Promise<{ id: string }>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

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
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ id: mockId }) });

    const result = await generateWrappedDataFromManual(mockManualGames);

    // Ensure we attempted to parse a CSV string with the expected header
    expect(mockParseCsv).toHaveBeenCalledTimes(1);
    expect(typeof mockParseCsv.mock.calls[0][0]).toBe('string');
    expect(String(mockParseCsv.mock.calls[0][0])).toContain('Title,Platform,Review Score,Review Notes');

    // The underlying generateWrappedData should post to /api/generate with the parsed games
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/generate'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games: parsedGames }),
      })
    );

    expect(result).toEqual({ id: mockId });
  });

  it('should throw an error if no games are provided', async () => {
    await expect(generateWrappedDataFromManual([])).rejects.toThrow(
      'No games provided. Please add some games to your list.'
    );
    // No calls made when validation fails
    expect(mockParseCsv).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
