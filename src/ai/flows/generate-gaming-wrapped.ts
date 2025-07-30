'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NarrativeCard, WrappedData } from '@/types';

const GenerateGamingWrappedInputSchema = z.object({
  games: z.array(z.object({
    title: z.string(),
    platform: z.string(),
    score: z.union([z.string(), z.number()]),
    notes: z.string(),
  })).describe('Array of game objects'),
});
export type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

const CARD_TYPES = ['platform_stats', 'top_game', 'summary', 'narrative'];

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

const GenerateGamingWrappedOutputSchema = z.object({
  cards: z.array(z.union([
    PlatformStatsCardSchema,
    TopGameCardSchema,
    SummaryCardSchema,
    NarrativeCardSchema,
  ])),
});
export type GenerateGamingWrappedOutput = z.infer<typeof GenerateGamingWrappedOutputSchema>;

type AnyCard = z.infer<typeof PlatformStatsCardSchema>|z.infer<typeof TopGameCardSchema>|z.infer<typeof SummaryCardSchema>|z.infer<typeof NarrativeCardSchema>;
export async function generateGamingWrapped(input: GenerateGamingWrappedInput): Promise<WrappedData> {
  const result = await generateGamingWrappedFlow(input);
  return { cards: result.cards as AnyCard[] };
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
