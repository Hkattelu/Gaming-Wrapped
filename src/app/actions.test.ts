// Mock the fetch function
global.fetch = jest.fn();

describe('generateWrappedData', () => {
  let generateWrappedData: any; // Declare generateWrappedData here
  let parseCsv: jest.Mock; // Declare parseCsv here

  beforeAll(() => {
    // Mock process.env before importing actions.ts
    process.env = { ...process.env, HOST_URL: 'test.vercel.app', NEXT_PUBLIC_API_PORT: '3000' };
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    jest.resetModules(); // Reset module registry to clear cached imports

    // Mock the csv module before importing actions.ts
    jest.mock('@/lib/csv', () => ({
      parseCsv: jest.fn(),
    }));

    // Dynamically import generateWrappedData and parseCsv after mocking
    generateWrappedData = require('./actions').generateWrappedData;
    parseCsv = require('@/lib/csv').parseCsv;

    global.fetch = jest.fn(); // Re-assign fetch to a new mock for each test
  });

  it('should generate wrapped data successfully', async () => {
    const mockCsvText = 'game1,platform1,hours1\ngame2,platform2,hours2';
    const mockGames = [
      { name: 'game1', platform: 'platform1', hours: 1 },
      { name: 'game2', platform: 'platform2', hours: 2 },
    ];
    const mockAiResponse = { summary: 'AI generated summary' };
    const mockId = 'test-id';

    (parseCsv as jest.Mock).mockReturnValue(mockGames);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: mockId, wrapped: mockAiResponse }),
    });

    const result = await generateWrappedData(mockCsvText);

    expect(parseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(global.fetch).toHaveBeenCalledWith(
      `https://test.vercel.app/api/generate`,
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
    (parseCsv as jest.Mock).mockReturnValue([]);

    await expect(generateWrappedData(mockCsvText)).rejects.toThrow(
      'No valid game data found in the CSV. Please check the file format.'
    );
    expect(parseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should throw an error if API call fails', async () => {
    const mockCsvText = 'game1,platform1,hours1';
    const mockGames = [
      { name: 'game1', platform: 'platform1', hours: 1 },
    ];
    const mockErrorData = { error: 'API error message' };

    (parseCsv as jest.Mock).mockReturnValue(mockGames);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve(mockErrorData),
    });

    await expect(generateWrappedData(mockCsvText)).rejects.toThrow(
      'Failed to generate your Rewind. API error message'
    );
    expect(parseCsv).toHaveBeenCalledWith(mockCsvText);
    expect(global.fetch).toHaveBeenCalled();
  });
});