import { jest } from '@jest/globals';
import { MOCK_WRAPPED_OUTPUT } from '@/ai/dev-wrapped';

const MOCK_RESPONSE_TEXT = JSON.stringify(MOCK_WRAPPED_OUTPUT);

const generateMock = jest.fn(async () => ({
  candidates: [
    {
      message: {
        content: [
          {
            text: MOCK_RESPONSE_TEXT,
          },
        ],
      },
    },
  ],
}));

export const googleAI = () => ({
  // Minimal stub that mirrors the high-level shape of a GoogleAI
  // generate() response used by Genkit. Tests can rely on this to
  // return a stable wrapped payload without making real API calls.
  generate: generateMock,
});

export { MOCK_RESPONSE_TEXT };
