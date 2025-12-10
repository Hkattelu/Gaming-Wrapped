import type { GenerateGamingWrappedOutput } from './flows/generate-gaming-wrapped';

export const MOCK_WRAPPED_OUTPUT: GenerateGamingWrappedOutput = {
  cards: [
    {
      type: 'summary',
      title: 'Mock Summary',
      description: 'This is a mock summary',
      totalGames: 10,
      averageScore: 8.5,
    },
  ],
};
