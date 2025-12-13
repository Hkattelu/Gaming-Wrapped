'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MOCK_WRAPPED_OUTPUT } from '@/ai/dev-wrapped';

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

type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

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
] as const;

type CardType = (typeof CARD_TYPES)[number];

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
  roast: z.string().describe("A roast of the user's gaming habits"),
});

const RecommendationsCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the recommendations card'),
  recommendations: z.array(z.string()).describe('A list of game recommendations'),
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
  ])),
});

export type GenerateGamingWrappedOutput = z.infer<typeof GenerateGamingWrappedOutputSchema>;

export async function generateGamingWrapped(input: GenerateGamingWrappedInput): Promise<GenerateGamingWrappedOutput> {
  if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_WRAPPED_OUTPUT === 'true') {
    return MOCK_WRAPPED_OUTPUT;
  }
  const result = await generateGamingWrappedFlow(input);
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateGamingWrappedPrompt',
  input: { schema: z.object({games: z.string()}) },
  output: { schema: GenerateGamingWrappedOutputSchema },
  prompt: `You are a creative storyteller who specializes in generating personalized gaming year summaries.

Analyze the following gaming data and create a fun and engaging "Gaming Wrapped" in the form of a series of cards.

=====
Gaming Data: {{games}}
=====

## Instructions

Generate a JSON object with a "cards" array. Each card in the array should be one of the following types:

1.  summary: A card with the total number of games and the average score.
2.  platform_stats: A card with the distribution of games by platform.
3.  top_game: A card with the user's top-rated game. If many entries are unrated, infer a likely top pick using notes, completion status, or platform frequency.
4.  narrative: A card with a short, engaging paragraph about the user's gaming year.
5.  genre_breakdown: A card that analyzes the game titles and notes to show the user's most played genres.
6.  score_distribution: A chart that shows how many games fall into different score ranges (e.g., 9-10, 7-8, etc.). Ignore missing scores rather than treating them as zero.
7.  hidden_gem: A card that highlights a game that isn't the highest-rated but seems interesting based on the user's notes.
8.  player_persona: Assigns a persona based on a holistic view of their gaming habits. See the Player Persona Taxonomy below and choose EXACTLY ONE persona.
9.  gamer_alignment: Assigns a Dungeons & Dragons-style alignment based on play style.
10. roast: Provide a light-hearted, specific, PG-13 roast (1–2 sentences) based on patterns (backlog size, platform bias, abandoned games, sequel marathons, etc.). Avoid personal/sensitive topics; keep it playful, not mean.
11. recommendations: The AI recommends you new games based on your history.

Additional guidance:
- Be lenient with missing ratings: do not fixate on "nothing is rated". Use notes, completion, platform frequency, and common sense signals to draw conclusions.
- When computing averages or distributions, ignore missing scores.
- Prefer concise, vivid language with concrete details.
- When unsure, make a sensible assumption and move on rather than dwelling on missing data.

You can create multiple narrative cards.

### Player Persona Taxonomy
Choose exactly one persona below. Set the card fields as:
- title: A short, punchy title (e.g., "YOUR PLAYER PERSONA").
- persona: Must be exactly one of the names below.
- description: Use the provided description verbatim or lightly adapt to fit the user's data without changing its meaning.

Personas:
- The Loyal Legend — For the player who dedicates hundreds of hours to a single game. You are the pillar of a community, a master of your chosen domain. While others may jump from trend to trend, you find beauty in dedication and perfection in practice. You know every map, every character, every optimal strategy, and your name is whispered with respect in the lobbies you frequent. You're not just playing a game; you're living in its world, and it's a world you've truly made your own.
- The Platinum Plunderer — For the player who is a dedicated achievement hunter and completionist. For you, the credits rolling is just the beginning. Your quest isn't over until every achievement is unlocked, every collectible is found, and every secret is unearthed. This meticulous dedication shows a player who appreciates the entire craft of a game, from the main story to the smallest details. Your game library isn't a list; it's a gallery of 100% trophies.
- The Squadron Leader — For the player who primarily plays co-op and multiplayer games with friends. You are the heart of the fireteam, the one who rallies the troops for one more match. For you, gaming is a team sport. The greatest victories aren't just about winning, but about the shared moments of triumph, the perfectly executed strategies, and the laughter over voice chat. You build communities and forge friendships, proving that the best adventures are the ones we share.
- The Narrative Navigator — For the player who loves deep, story-driven, single-player experiences. You seek more than just gameplay; you seek worlds to inhabit and stories that resonate long after the game is over. You're drawn to rich lore, complex characters, and emotional journeys. You'll gladly spend hours immersed in dialogue, reading every lore entry, and watching every cutscene. You are a digital storyteller, piecing together epic sagas one quest at a time.
- The Apex Predator — For the player who thrives in competitive, high-stakes, ranked gameplay. You are fueled by the thrill of competition. Every match is a test of skill, strategy, and nerve. You study the meta, perfect your mechanics, and live for the clutch play that turns the tide. Climbing the leaderboards isn't just a goal; it's a calling. You thrive under pressure and prove time and again that you have what it takes to stand at the top.
- The Cozy Cultivator — For the player who enjoys relaxing, low-stakes games like farming sims, life sims, and creative sandboxes. In a world of high-octane action, you've discovered the profound joy of peace. You find satisfaction in building a perfect farm, designing a dream home, or simply watching your virtual world grow. Your gameplay is a form of meditation—a relaxing escape where creativity and patience are the ultimate virtues. You don't just play games; you build serene sanctuaries.
- The Artisan Adventurer — For the player who predominantly plays and discovers unique indie titles. You are a digital curator with an impeccable taste for the unique and the innovative. You look past the blockbuster hype to find hidden gems with heartfelt stories, groundbreaking mechanics, and bold artistic vision. Your library is a testament to the creativity of passionate developers, and you champion the games that dare to be different. You don't follow the trends; you discover them.
- The Master Architect — For the player who loves building, management, and strategy games (e.g., Minecraft, Factorio, Cities: Skylines). You see beyond the pixels and envision a grand design. Whether you're constructing a sprawling medieval kingdom, an automated mega-factory, or a bustling metropolis, your mind is always working. You are a planner, an engineer, and a visionary. Your satisfaction comes not from a final boss, but from watching a complex system of your own creation run like a well-oiled machine.
- The High-Octane Hero — For the player who loves fast-paced, non-stop action games (e.g., Shooters, Hack-n-Slash). Subtlety is optional. You crave speed, spectacle, and the roar of a perfectly executed combo. Your gameplay is a symphony of controlled chaos, defined by lightning-fast reflexes and an aggressive, forward-moving style. You are the unstoppable force, the one-person army who faces down impossible odds and walks away from the explosion without looking back.
- The Vanguard Gamer — For the player who is always playing the newest, hottest releases. You have your finger on the pulse of the industry. You're the first to dive into the most anticipated titles, exploring new worlds the moment they launch. Your friends look to you for recommendations because you've already seen what's next. You are a pioneer, experiencing the evolution of gaming in real-time and always ready for the next big thing.
  `,
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
