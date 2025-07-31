import { jest, describe, expect, it, beforeAll, beforeEach, } from '@jest/globals';
import { ManualGame, WrappedData } from '@/types';

// Mock the fetch function
global.fetch = jest.fn();

// Declare mockParseCsv with 'mock' prefix
let mockParseCsv: jest.Mock;
let mockCalculateStats: jest.Mock;
let mockManualGamesToCsv: jest.Mock;
let mockGenerateGamingWrapped: jest.Mock;

// Mock the csv module, referencing mockParseCsv
jest.mock('@/lib/csv', () => ({
  parseCsv: jest.fn((csvText: string) => mockParseCsv(csvText)), // Reference the prefixed variable
  manualGamesToCsv: jest.fn((games: ManualGame[]) => mockManualGamesToCsv(games)),
}));

jest.mock('@/lib/stats', () => ({
  calculateStats: jest.fn((games: any) => mockCalculateStats(games)),
}));

jest.mock('@/ai/flows/generate-gaming-wrapped', () => ({
  generateGamingWrapped: jest.fn((data: any) => mockGenerateGamingWrapped(data)),
}));

describe('generateWrappedData', () => {
  let generateWrappedData: any; // Declare generateWrappedData here

  beforeAll(() => {
    // Mock process.env before importing actions.ts
    process.env = { ...process.env, HOST_URL: 'test.vercel.app', NEXT_PUBLIC_API_PORT: '3000' };
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    jest.resetModules(); // Reset module registry to clear cached imports

    mockParseCsv = jest.requireMock('@/lib/csv').parseCsv;
    // Dynamically import generateWrappedData and parseCsv after mocking
    generateWrappedData = require('./actions').generateWrappedData;

    global.fetch = jest.fn(); // Re-assign fetch to a new mock for each test
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
  let generateWrappedDataFromManual: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockCalculateStats = jest.requireMock('@/lib/stats').calculateStats;
    mockManualGamesToCsv = jest.requireMock('@/lib/csv').manualGamesToCsv;
    mockGenerateGamingWrapped = jest.requireMock('@/ai/flows/generate-gaming-wrapped').generateGamingWrapped;

    generateWrappedDataFromManual = require('./actions').generateWrappedDataFromManual;
  });

  it('should generate wrapped data from manual input successfully', async () => {
    const mockManualGames: ManualGame[] = [
      { id: '1', title: 'Game 1', platform: 'PC', status: 'Finished', score: '9' },
      { id: '2', title: 'Game 2', platform: 'PS5', status: 'Completed', score: '8' },
    ];
    const mockStats = { totalGames: 2, averageScore: 8.5 };
    const mockCsvText = 'title,platform,score,notes\nGame 1,PC,9,Finished\nGame 2,PS5,8,Completed';
    const mockAiResponse = { cards: [] };

    mockCalculateStats.mockReturnValue(mockStats);
    mockManualGamesToCsv.mockReturnValue(mockCsvText);
    mockGenerateGamingWrapped.mockResolvedValue(mockAiResponse);

    const result = await generateWrappedDataFromManual(mockManualGames);

    expect(mockCalculateStats).toHaveBeenCalledWith([
      { title: 'Game 1', platform: 'PC', score: 9, notes: 'Finished' },
      { title: 'Game 2', platform: 'PS5', score: 8, notes: 'Completed' },
    ]);
    expect(mockManualGamesToCsv).toHaveBeenCalledWith(mockManualGames);
    expect(mockGenerateGamingWrapped).toHaveBeenCalledWith({ csvData: mockCsvText });
    expect(result).toEqual({
      basicStats: mockStats,
      aiResponse: mockAiResponse,
    });
  });

  it('should throw an error if no games are provided', async () => {
    await expect(generateWrappedDataFromManual([])).rejects.toThrow(
      'No games provided. Please add some games to your list.'
    );
    expect(mockCalculateStats).not.toHaveBeenCalled();
    expect(mockManualGamesToCsv).not.toHaveBeenCalled();
    expect(mockGenerateGamingWrapped).not.toHaveBeenCalled();
  });
});