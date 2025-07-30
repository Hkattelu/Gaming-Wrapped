'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateGamingWrappedInputSchema = z.object({
  games: z.array(z.object({
    title: z.string(),
    platform: z.string(),
    score: z.union([z.string(), z.number()]),
    notes: z.string(),
  })).describe('Array of game objects'),
});
export type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

const CARD_TYPES = ['platform_stats', 'top_game', 'summary', 'genre_breakdown', 'score_distribution', 'hidden_gem', 'narrative'];                                                                                               
const PlatformStatsCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the platform stats card'),
  description: z.string().describe('A short description of the platform stats'),
  data: z.array(z.object({
    platform: z.string(),
    count: z.number(),
  })).describe('Array of platform stats'),
});

const TopGameCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the top game card'),
  description: z.string().describe('A short description of the top game'),
  game: z.object({
    title: z.string(),
    platform: z.string(),
    score: z.union([z.string(), z.number()]),
    notes: z.string(),
  }),
});

const SummaryCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the summary card'),
  description: z.string().describe('A short description of the summary'),
  totalGames: z.number(),
  averageScore: z.number(),
});

const NarrativeCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the narrative card'),
  content: z.string().describe("A short, engaging paragraph about the user's gaming year"),
});

const GenreBreakdownCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the genre breakdown card'),
  description: z.string().describe('A short description of the genre breakdown'),
  data: z.array(z.object({
    genre: z.string(),
    count: z.number(),
  })).describe('Array of genre stats'),
});

const ScoreDistributionCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the score distribution card'),
  description: z.string().describe('A short description of the score distribution'),
  data: z.array(z.object({
    range: z.string(),
    count: z.number(),
  })).describe('Array of score distribution stats'),
});

const HiddenGemCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the hidden gem card'),
  description: z.string().describe('A short description of the hidden gem'),
  game: z.object({
    title: z.string(),
    platform: z.string(),
    score: z.union([z.string(), z.number()]),
    notes: z.string(),
  }),
});

const GenerateGamingWrappedOutputSchema = z.object({
  cards: z.array(z.union([
    PlatformStatsCardSchema,
    TopGameCardSchema,
    SummaryCardSchema,
    NarrativeCardSchema,
    GenreBreakdownCardSchema,
    ScoreDistributionCardSchema,
    HiddenGemCardSchema,
  ])),
});
export type GenerateGamingWrappedOutput = z.infer<typeof GenerateGamingWrappedOutputSchema>;

export async function generateGamingWrapped(input: GenerateGamingWrappedInput): Promise<AiResponse> {
  const result = await generateGamingWrappedFlow(input);
  return { cards: result.cards as any };
}

const prompt = ai.definePrompt({
  name: 'generateGamingWrappedPrompt',
  input: { schema: GenerateGamingWrappedInputSchema },
  output: { schema: GenerateGamingWrappedOutputSchema },
  prompt: `You are a creative storyteller who specializes in generating personalized gaming year summaries.

  Analyze the following gaming data and create a fun and engaging "Gaming Wrapped" in the form of a series of cards.

  Gaming Data: {{@games}}

  ## Instructions

  Generate a JSON object with a "cards" array. Each card in the array should be one of the following types:

  1.  **summary**: A card with the total number of games and the average score.
  2.  **platform_stats**: A card with the distribution of games by platform.
  3.  **top_game**: A card with the user's top-rated game.
  4.  **narrative**: A card with a short, engaging paragraph about the user's gaming year.
  5.  **genre_breakdown**: A card that analyzes the game titles and notes to show the user's most played genres.
  6.  **score_distribution**: A chart that shows how many games fall into different score ranges (e.g., 9-10, 7-8, etc.).
  7.  **hidden_gem**: A card that highlights a game that isn't the highest-rated but seems interesting based on the user's notes.

  You can create multiple narrative cards.
  `,
});

const generateGamingWrappedFlow = ai.defineFlow(
  {
    name: 'generateGamingWrappedFlow',
    inputSchema: GenerateGamingWrappedInputSchema,
    outputSchema: GenerateGamingWrappedOutputSchema,
  },
  async input => {
    const { output } = await prompt({ games: input.games });
    return output!;
  }
);
