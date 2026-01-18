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
    playtime: z.union([z.string(), z.number()]).optional().describe("Playtime in minutes"),
  })).describe('Array of game objects'),
});

type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

const CARD_TYPES = [
  'platform_stats',
  'top_game',
  'summary',
  'genre_breakdown',
  'score_distribution',
  'player_persona',
  'roast',
  'recommendations',
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
    formattedScore: z.string().optional().describe("The score formatted with the maximum scale, e.g., '9/10', '4.5/5', '95/100'."),
    notes: z.string(),
  }),
});

const SummaryCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the summary card'),
  description: z.string().describe('A short description of the summary'),
  totalGames: z.number(),
  averageScore: z.number(),
  completionPercentage: z.number().optional().describe('Percentage of games completed'),
  rank: z.string().optional().describe('The player rank based on volume (e.g., Bronze, Gold, Diamond)'),
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

const PlayerPersonaCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the player persona card'),
  persona: z.string().describe('The assigned player persona'),
  description: z.string().describe('A description of the player persona'),
});

const RoastCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the roast card'),
  roast: z.string().describe("A roast of the user's gaming habits"),
  trigger: z.string().describe("The specific data point that triggered this roast (e.g., 'Trigger: 4000 hours in Stardew Valley', 'Trigger: 0% completion rate')"),
});

const RecommendationsCardSchema = z.object({
  type: z.enum(CARD_TYPES),
  title: z.string().describe('Title for the recommendations card'),
  recommendations: z.array(z.object({
    game: z.string().describe('The title of the recommended game'),
    blurb: z.string().describe('A short, personalized reason why this game is recommended based on the user\'s gaming history'),
  })).describe('A list of game recommendations with personalized explanations'),
});

const GenerateGamingWrappedOutputSchema = z.object({
  cards: z.array(z.union([
    PlatformStatsCardSchema,
    TopGameCardSchema,
    SummaryCardSchema,
    GenreBreakdownCardSchema,
    ScoreDistributionCardSchema,
    PlayerPersonaCardSchema,
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
  input: { schema: z.object({ games: z.string(), context: z.string() }) },
  output: { schema: GenerateGamingWrappedOutputSchema },
  prompt: `You are a creative storyteller who specializes in generating personalized gaming history summaries.

Analyze the following gaming data and create a fun and engaging "Gaming Wrapped" in the form of a series of cards.

{{context}}

=====
Gaming Data: {{games}}
=====

## Instructions

Generate a JSON object with a "cards" array. Each card in the array should be one of the following types. 
IMPORTANT: Adhere strictly to the "Context" instructions above regarding which cards to include or exclude.

1.  summary: A card with the total number of games and the average score. Always include this.
2.  platform_stats: A card with the distribution of games by platform.
3.  top_game: A card with the user's top-rated game. If many entries are unrated, infer a likely top pick using 'playtime' (highest is best), notes, completion status, or platform frequency.
4.  genre_breakdown: A card that analyzes the game titles and notes to show the user's most played genres.
5.  score_distribution: A chart that shows how many games fall into different score ranges (e.g., 9-10, 7-8, etc.).
6.  player_persona: Assigns a persona based on a holistic view of their gaming habits (including playtime and genres). See the Player Persona Taxonomy below and choose EXACTLY ONE persona.
7.  roast: Provide a sharp, witty, and slightly mean roast (1–2 sentences). Focus on specific habits like backlog hoarding (many games, 0 playtime), playing only one game forever, having terrible taste (high scores for bad games), or never finishing anything. Be a "tough love" critic. Do not hold back.
8.  recommendations: Provide "Unexpected Picks" that align with their "Hidden Tastes." For example, if they love high-score RPGs, suggest an obscure indie visual novel with great writing. Avoid obvious blockbusters. The goal is to introduce them to something new they'd actually love.

Additional guidance:
- Be lenient with missing ratings: do not fixate on "nothing is rated". Use 'playtime', notes, completion, platform frequency, and common sense signals to draw conclusions.
- When computing averages or distributions, ignore missing scores.
- Prefer concise, vivid language with concrete details.
- When unsure, make a sensible assumption and move on rather than dwelling on missing data.



### Player Persona Taxonomy
Choose exactly one persona below. Set the card fields as:
- title: A short, punchy title (e.g., "YOUR PLAYER PERSONA").
- persona: Must be exactly one of the names below.
- description: Use the provided description verbatim or lightly adapt to fit the user's data without changing its meaning.

Personas:
- The Loyal Legend — For the player who dedicates hundreds of hours to a single game. You are the pillar of a community, a master of your chosen domain. While others may jump from trend to trend, you find beauty in dedication and perfection in practice. You know every map, every character, every optimal strategy, and your name is whispered with respect in the lobbies you frequent. You're not just playing a game; you're living in its world.
- The Platinum Plunderer — For the player who is a dedicated achievement hunter and completionist. For you, the credits rolling is just the beginning. Your quest isn't over until every achievement is unlocked, every collectible is found, and every secret is unearthed. This meticulous dedication shows a player who appreciates the entire craft of a game. Your game library isn't a list; it's a gallery of 100% trophies.
- The Squadron Leader — For the player who primarily plays co-op and multiplayer games with friends. You are the heart of the fireteam, the one who rallies the troops for one more match. For you, gaming is a team sport. The greatest victories aren't just about winning, but about the shared moments of triumph, the perfectly executed strategies, and the laughter over voice chat. You build communities and forge friendships.
- The Narrative Navigator — For the player who loves deep, story-driven, single-player experiences. You seek more than just gameplay; you seek worlds to inhabit and stories that resonate long after the game is over. You're drawn to rich lore, complex characters, and emotional journeys. You'll gladly spend hours immersed in dialogue, reading every lore entry, and watching every cutscene. You are a digital storyteller.
- The Apex Predator — For the player who thrives in competitive, high-stakes, ranked gameplay. You are fueled by the thrill of competition. Every match is a test of skill, strategy, and nerve. You study the meta, perfect your mechanics, and live for the clutch play that turns the tide. Climbing the leaderboards isn't just a goal; it's a calling. You thrive under pressure.
- The Cozy Cultivator — For the player who enjoys relaxing, low-stakes games like farming sims, life sims, and creative sandboxes. In a world of high-octane action, you've discovered the profound joy of peace. You find satisfaction in building a perfect farm, designing a dream home, or simply watching your virtual world grow. Your gameplay is a form of meditation—a relaxing escape where creativity and patience are the ultimate virtues.
- The Artisan Adventurer — For the player who predominantly plays and discovers unique indie titles. You are a digital curator with an impeccable taste for the unique and the innovative. You look past the blockbuster hype to find hidden gems with heartfelt stories, groundbreaking mechanics, and bold artistic vision. Your library is a testament to the creativity of passionate developers. You don't follow the trends; you discover them.
- The Master Architect — For the player who loves building, management, and strategy games (e.g., Minecraft, Factorio, Cities: Skylines). You see beyond the pixels and envision a grand design. Whether you're constructing a sprawling medieval kingdom, an automated mega-factory, or a bustling metropolis, your mind is always working. You are a planner, an engineer, and a visionary. Your satisfaction comes from watching a complex system run like a well-oiled machine.
- The High-Octane Hero — For the player who loves fast-paced, non-stop action games (e.g., Shooters, Hack-n-Slash). Subtlety is optional. You crave speed, spectacle, and the roar of a perfectly executed combo. Your gameplay is a symphony of controlled chaos, defined by lightning-fast reflexes and an aggressive, forward-moving style. You are the unstoppable force.
- The Vanguard Gamer — For the player who is always playing the newest, hottest releases. You have your finger on the pulse of the industry. You're the first to dive into the most anticipated titles, exploring new worlds the moment they launch. Your friends look to you for recommendations because you've already seen what's next. You are a pioneer, experiencing the evolution of gaming in real-time.
- The Backlog Baron — For the player with hundreds of games but only a handful played. You are a collector of potential experiences. You see a sale, you buy the game, you promise yourself you'll play it "someday." Your library is a library of Alexandria, full of knowledge and stories waiting to be opened. You are the patron saint of game developers, supporting the industry one unplayed purchase at a time.
- The Digital Hoarder — For the player who plays a little bit of everything but finishes nothing. You are a sampler of worlds, a tourist of genres. You dip your toes into every new release, play for a few hours, and then get distracted by the next shiny object. Your save files are a graveyard of abandoned protagonists waiting for your return. You don't have a main game; you have a main menu.
- The Completionist Cultist — For the player who doesn't just play games, they colonize them. 100% completion isn't a goal; it's a religion. You'll spend 40 hours hunting a single collectible just to see a number change from 99 to 100. Your patience is legendary, your dedication is terrifying, and your backlog is crying for help.
- The Early Access Enthusiast — For the player who lives on the bleeding edge of bugs and unfinished features. You prefer your games like your steaks: raw and potentially dangerous. You've seen more "Work in Progress" screens than finished credits. You don't just play games; you beta test the future, one crash at a time.
- The Diamond in the Rough Digger — For the player who finds beauty in the underrated. You spent most of your time in games others might have overlooked or dismissed. You don't care about Metacritic scores; you care about soul. You are a treasure hunter in a world of blockbusters.
- The Speedrun Sorcerer — For the player who views games as obstacle courses. Why enjoy the scenery when you can glitch through a wall at Mach 2? You know every frame of animation and every skip, and you've probably forgotten what the actual plot was.
- The Modded Maestro — For the player who doesn't play the game; they play the 400 mods they installed. Half your "playtime" is actually just troubleshooting load orders and making sure the grass textures don't crash your PC. You've improved the developers' work beyond recognition.
- The Digital Monogamist — For the player who marries one game and treats all others like side-flings. You have 4,000 hours in one title and 1 hour in 100 others. You don't need a library; you need a life sentence in your chosen world. Commitment issues? Not here.
  `,
});

const generateGamingWrappedFlow = ai.defineFlow(
  {
    name: 'generateGamingWrappedFlow',
    inputSchema: GenerateGamingWrappedInputSchema,
    outputSchema: GenerateGamingWrappedOutputSchema,
  },
  async input => {
    // Analyze input data for quality/sufficiency
    const games = input.games || [];
    const totalGames = games.length;

    const normalizeMarker = (value?: string) => (value ?? '').trim().toUpperCase();
    const normalizeScore = (value?: string) => (value ?? '').trim();
    const isMarked = (value?: string) => {
      const v = normalizeMarker(value);
      // HLTB exports use 'X', but accept a few common truthy markers to avoid skew from minor CSV variations.
      return v === 'X' || v === 'TRUE' || v === 'CHECK' || v === 'YES' || v === 'Y' || v === '1';
    };

    // Count rated games (assuming 'review' is the score field)
    // Filter out '0' scores as they typically represent unrated games in HLTB exports
    const ratedGames = games.filter(g => {
      const review = normalizeScore(g.review);
      return Boolean(review) && review !== '0';
    }).length;

    // Count platforms
    const platforms = new Set(games.map(g => g.platform).filter(p => p && p.trim() !== ''));
    const uniquePlatforms = platforms.size;

    // Count completions
    // HLTB CSV uses 'X' for completed games. Also check for 'true'/'check' for potential other formats.
    const completedGames = games.filter(g => isMarked(g.completed) || isMarked(g.mainStory)).length;

    // Calculate Backlog Hoarding
    const backlogCount = games.filter(g => isMarked(g.backlog)).length;
    const hoardingRatio = totalGames > 0 ? (backlogCount / totalGames) : 0;

    // Platform analysis
    const platformCounts: Record<string, number> = {};
    games.forEach(g => {
      if (g.platform) platformCounts[g.platform] = (platformCounts[g.platform] || 0) + 1;
    });
    const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Average Score
    const rawScores = games.map(g => parseFloat(g.review || '')).filter(s => !isNaN(s) && s > 0);
    const averageRating = rawScores.length > 0 ? rawScores.reduce((a, b) => a + b, 0) / rawScores.length : 0;

    // Build Context Instructions
    let contextInstructions = "### DATA QUALITY & INCLUSION RULES\n";
    contextInstructions += `USER METRICS: Total Games: ${totalGames}, Completed: ${completedGames}, Backlog: ${backlogCount}, Top Platform: ${topPlatform}, Avg Rating: ${averageRating.toFixed(1)}\n`;

    if (hoardingRatio > 0.7) {
      contextInstructions += "- HIGH HOARDING RATIO DETECTED. Lean towards 'The Backlog Baron' persona.\n";
    }
    if (averageRating < 6 && rawScores.length > 3) {
      contextInstructions += "- LOW AVERAGE RATING DETECTED. Lean towards 'The Diamond in the Rough Digger' or a roast about having bad taste.\n";
    }
    
    // Rule 1: Platform Stats
    if (uniquePlatforms <= 1) {
      contextInstructions += "- Only one platform detected. DO NOT generate the 'platform_stats' card.\n";
    } else {
      contextInstructions += "- Multiple platforms detected. YOU MUST generate the 'platform_stats' card.\n";
    }

    // Rule 2: Score Distribution
    if (ratedGames < 5) {
      contextInstructions += `- Only ${ratedGames} games are rated. DO NOT generate the 'score_distribution' card as there is insufficient data.\n`;
      contextInstructions += "- For the 'summary' card, you may calculate the average score if at least one game is rated, otherwise set it to 0.\n";
    } else {
      contextInstructions += "- Sufficient ratings available. YOU MUST generate the 'score_distribution' card.\n";
    }

    // Rule 3: Completion Data
    if (completedGames === 0) {
      contextInstructions += "- No completion data found. Do not mention completion rates or 100% completion in the 'summary' or 'roast'.\n";
    }

    // Rule 4: General Robustness
    contextInstructions += "- If a specific card type's required data is completely missing, SKIP that card type rather than hallucinating data.\n";

    // Rule 5: Score Scale Detection
    if (rawScores.length > 0) {
      const maxScore = Math.max(...rawScores);
      if (maxScore <= 5) {
        contextInstructions += "- The ratings appear to be on a 5-point scale. PLEASE NORMALIZE THESE TO A 10-POINT SCALE (multiply by 2) for the 'averageScore' and 'score_distribution' ranges.\n";
        contextInstructions += "- However, for the 'top_game' card's 'formattedScore', usage the ORIGINAL 5-point scale (e.g. '5/5').\n";
      } else {
        contextInstructions += "- For the 'top_game' card, set 'formattedScore' to the score formatted with its likely maximum (e.g. '9/10' if 10-point, '90/100' if 100-point).\n";
      }
    }

    // Execute the Generation.
    const { output } = await prompt({
      games: JSON.stringify(games),
      context: contextInstructions
    });

    // Post-processing: Inject accurate stats if available
    if (output && output.cards) {
      const summaryCard = output.cards.find(c => c.type === 'summary');
      if (summaryCard) {
        // Determine rank based on total games
        const total = totalGames;
        let rank = "BRONZE";
        if (total > 100) rank = "MASTER";
        else if (total > 50) rank = "DIAMOND";
        else if (total > 25) rank = "PLATINUM";
        else if (total > 10) rank = "GOLD";
        else if (total > 5) rank = "SILVER";
        
        // @ts-expect-error Property 'rank' does not exist on type
        summaryCard.rank = rank;

        // Determine completion percentage if data exists
        if (completedGames > 0 && totalGames > 0) {
          // @ts-expect-error Property 'completionPercentage' does not exist on type
          summaryCard.completionPercentage = Math.round((completedGames / totalGames) * 100);
        }

        // Calculate total playtime
        const totalPlaytimeMinutes = games.reduce((acc, game) => {
          const minutes = typeof game.playtime === 'number' ? game.playtime : parseFloat(game.playtime || '0');
          return acc + (isNaN(minutes) ? 0 : minutes);
        }, 0);

        if (totalPlaytimeMinutes > 0) {
          // @ts-expect-error Property 'totalPlaytime' does not exist on type
          summaryCard.totalPlaytime = totalPlaytimeMinutes;
        }
      }
    }

    return output!;
  }
);
