'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateGamingWrappedInputSchema = z.object({
  games: z.array(z.object({
    title: z.string().optional().describe("Title"),
    platform: z.string().optional().describe("Platform"),
    review: z.string().optional().describe("Review score. Typically out of 10."),
    playing: z.string().optional().describe("Playing"),
    backlog: z.string().optional().describe("Backlog"),
    replay: z.string().optional().describe("Replay"),
    online: z.string().optional().describe("Online"),
    custom2: z.string().optional().describe("Custom notes"),
    custom3: z.string().optional().describe("More Custom notes"),
    completed: z.string().optional().describe("Whether the game was completed"),
    retired: z.string().optional().describe("Whether the game was retired"),
    retiredNotes: z.string().optional().describe("Notes for why the game was retired"),
    startDate: z.string().optional().describe("Start Date"),
    completionDate: z.string().optional().describe("Completion Date"),
    playthrough: z.string().optional().describe("What kind of playthrough it was"),
    progress: z.string().optional().describe("Progress"),
    mainStory: z.string().optional().describe("Main Story"),
    mainStoryNotes: z.string().optional().describe("Main Story Notes"),
    mainPlusExtras: z.string().optional().describe("Main + Extras"),
    mainPlusExtrasNotes: z.string().optional().describe("Main + Extras Notes"),
    completionist: z.string().optional().describe("Completionist"),
    completionistNotes: z.string().optional().describe("Completionist Notes"),
    speedAnyPercent: z.string().optional().describe("Speedrun Any%"),
    speedAnyPercentNotes: z.string().optional().describe("Speed Any% Notes"),
    speed100Percent: z.string().optional().describe("Speed 100%"),
    speed100PercentNotes: z.string().optional().describe("Speed 100% Notes"),
    coOp: z.string().optional().describe("Co-Op"),
    multiPlayer: z.string().optional().describe("Multi-Player"),
    generalNotes: z.string().optional().describe("General Notes"),
    storefront: z.string().optional().describe("Storefront"),
    reviewNotes: z.string().optional().describe("Review Notes"),
    added: z.string().optional().describe("The date this game was added"),
    updated: z.string().optional().describe("The date this entry was updaeted"),
  })).describe('Array of game objects'),
});
export type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

const CARD_TYPES = [
  'platform_stats', 
  'top_game', 
  'summary', 
  'genre_breakdown', 
  'score_distribution', 
  'hidden_gem', 
  'narrative',
  'player_persona',
  'gamer_alignment',
  'roast',
  'recommendations',
  'gaming_spirit_animal',
] as const;

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

const PlayerPersonaCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the player persona card'),
  persona: z.string().describe('The assigned player persona'),
  description: z.string().describe('A description of the player persona'),
});

const GamerAlignmentCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the gamer alignment card'),
  alignment: z.string().describe('The assigned gamer alignment'),
  description: z.string().describe('A description of the gamer alignment'),
});

const RoastCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the roast card'),
  roast: z.string().describe('A roast of the user\'s gaming habits'),
});

const RecommendationsCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the recommendations card'),
  recommendations: z.array(z.string()).describe('A list of game recommendations'),
});

const GamingSpiritAnimalCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the gaming spirit animal card'),
  animal: z.string().describe('The assigned gaming spirit animal'),
  description: z.string().describe('A description of the gaming spirit animal'),
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
    PlayerPersonaCardSchema,
    GamerAlignmentCardSchema,
    RoastCardSchema,
    RecommendationsCardSchema,
    GamingSpiritAnimalCardSchema,
  ])),
});
export type GenerateGamingWrappedOutput = z.infer<typeof GenerateGamingWrappedOutputSchema>;

export async function generateGamingWrapped(input: GenerateGamingWrappedInput): Promise<GenerateGamingWrappedOutput> {
  const result = await generateGamingWrappedFlow(input);
  return { cards: result.cards as any };
}

const prompt = ai.definePrompt({
  name: 'generateGamingWrappedPrompt',
  input: { schema: z.object({games: z.string()}) },
  output: { schema: GenerateGamingWrappedOutputSchema },
  prompt: `You are a creative storyteller who specializes in generating personalized gaming year summaries.\n\n  Analyze the following gaming data and create a fun and engaging "Gaming Wrapped" in the form of a series of cards.\n\n  =====\nGaming Data: {{games}}\n=====\n\n  ## Instructions\n\n  Generate a JSON object with a "cards" array. Each card in the array should be one of the following types:\n\n  1.  **summary**: A card with the total number of games and the average score.\n  2.  **platform_stats**: A card with the distribution of games by platform.\n  3.  **top_game**: A card with the user's top-rated game.\n  4.  **narrative**: A card with a short, engaging paragraph about the user's gaming year.\n  5.  **genre_breakdown**: A card that analyzes the game titles and notes to show the user's most played genres.\n  6.  **score_distribution**: A chart that shows how many games fall into different score ranges (e.g., 9-10, 7-8, etc.).\n  7.  **hidden_gem**: A card that highlights a game that isn't the highest-rated but seems interesting based on the user's notes.\n  8.  **player_persona**: Assigns a catchy "class" or "title" based on a holistic view of their gaming habits.\n  9.  **gamer_alignment**: Assigns a Dungeons & Dragons-style alignment based on play style.\n  10. **roast**: Gently (or not-so-gently) makes fun of the user's gaming habits.\n  11. **recommendations**: The AI recommends you new games based on your history.\n  12. **gaming_spirit_animal**: Compares the user's overall "vibe" to a famous game character or creature.\n\n  You can create multiple narrative cards.\n  `,
});

const generateGamingWrappedFlow = ai.defineFlow(
  {
    name: 'generateGamingWrappedFlow',
    inputSchema: GenerateGamingWrappedInputSchema,
    outputSchema: GenerateGamingWrappedOutputSchema,
  },
  async input => {
    const { output } = await prompt({ games: JSON.stringify(input.games) });
    return output!;
  }
);
