export const googleAI = () => ({
  generate: jest.fn().mockResolvedValue({
    candidates: () => [{
      message: {
        content: () => ({
          parts: [{
            text: JSON.stringify({
              cards: [
                {
                  type: 'summary',
                  title: 'Mock Summary',
                  description: 'This is a mock summary',
                  totalGames: 10,
                  averageScore: 8.5,
                },
              ],
            }),
          }],
        }),
      },
    }],
  }),
});
