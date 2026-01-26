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
    playtime: z.number().optional().describe("Playtime in minutes"),
  })).describe('Array of game objects'),
});

type GenerateGamingWrappedInput = z.infer<typeof GenerateGamingWrappedInputSchema>;

// Flattened Card schema to avoid nesting depth issues with Gemini API
const CardSchema = z.object({
  type: z.enum(['platform_stats', 'top_game', 'summary', 'genre_breakdown', 'score_distribution', 'player_persona', 'roast', 'recommendations']).describe('The type of card'),
  title: z.string().describe('Title for the card'),
  description: z.string().optional().describe('A short description'),
  
  // Summary card fields
  totalGames: z.number().optional(),
  averageScore: z.number().optional(),
  completionPercentage: z.number().optional(),
  rank: z.string().optional(),
  totalPlaytime: z.number().optional(),
  
  // Persona card fields
  persona: z.enum([
    "The Loyal Legend",
    "The Platinum Plunderer",
    "The Squadron Leader",
    "The Narrative Navigator",
    "The Apex Predator",
    "The Cozy Cultivator",
    "The Artisan Adventurer",
    "The Master Architect",
    "The High-Octane Hero",
    "The Vanguard Gamer",
    "The Backlog Baron",
    "The Digital Hoarder",
    "The Completionist Cultist",
    "The Early Access Enthusiast",
    "The Diamond in the Rough Digger",
    "The Speedrun Sorcerer",
    "The Modded Maestro",
    "The Digital Monogamist"
  ]).optional(),
  
  // Roast card fields
  roast: z.string().optional(),
  trigger: z.string().optional(),
  
  // Data array fields (platform_stats, genre_breakdown, score_distribution)
  data: z.array(z.object({
    platform: z.string().optional(),
    genre: z.string().optional(),
    count: z.number().optional(),
    range: z.string().optional(),
  })).optional(),
  
  // Top game fields
  game: z.object({
    title: z.string().optional(),
    platform: z.string().optional(),
    score: z.number().optional(),
    formattedScore: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  // Recommendations fields
  recommendations: z.array(z.object({
    game: z.string().optional(),
    blurb: z.string().optional(),
  })).optional(),
}).superRefine((card, ctx) => {
  const req = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

  switch (card.type) {
  case 'summary':
    if (card.totalGames == null) req(['totalGames'], 'summary requires totalGames');
    if (card.averageScore == null) req(['averageScore'], 'summary requires averageScore');
    break;

  case 'top_game':
    if (!card.game) {
      req(['game'], 'top_game requires game');
      break;
    }
    if (!card.game.title) req(['game', 'title'], 'top_game requires game.title');
    if (!card.game.platform) req(['game', 'platform'], 'top_game requires game.platform');
    break;

  case 'platform_stats': {
    const data = card.data;
    if (!data?.length) {
      req(['data'], 'platform_stats requires a non-empty data array');
      break;
    }
    data.forEach((row, i) => {
      if (!row.platform) req(['data', i, 'platform'], 'platform_stats requires data[].platform');
      if (row.count == null) req(['data', i, 'count'], 'platform_stats requires data[].count');
    });
    break;
  }

  case 'genre_breakdown': {
    const data = card.data;
    if (!data?.length) {
      req(['data'], 'genre_breakdown requires a non-empty data array');
      break;
    }
    data.forEach((row, i) => {
      if (!row.genre) req(['data', i, 'genre'], 'genre_breakdown requires data[].genre');
      if (row.count == null) req(['data', i, 'count'], 'genre_breakdown requires data[].count');
    });
    break;
  }

  case 'score_distribution': {
    const data = card.data;
    if (!data?.length) {
      req(['data'], 'score_distribution requires a non-empty data array');
      break;
    }
    data.forEach((row, i) => {
      if (!row.range) req(['data', i, 'range'], 'score_distribution requires data[].range');
      if (row.count == null) req(['data', i, 'count'], 'score_distribution requires data[].count');
    });
    break;
  }

  case 'player_persona':
    if (!card.persona) req(['persona'], 'player_persona requires persona');
    if (!card.description) req(['description'], 'player_persona requires description');
    break;

  case 'roast':
    if (!card.roast) req(['roast'], 'roast requires roast');
    break;

  case 'recommendations': {
    const recommendations = card.recommendations;
    if (!recommendations?.length) {
      req(['recommendations'], 'recommendations requires a non-empty list');
      break;
    }
    recommendations.forEach((rec, i) => {
      if (!rec.game) req(['recommendations', i, 'game'], 'recommendations requires recommendations[].game');
      if (!rec.blurb) req(['recommendations', i, 'blurb'], 'recommendations requires recommendations[].blurb');
    });
    break;
  }
  }
});

const GenerateGamingWrappedOutputSchema = z.object({
  cards: z.array(CardSchema),
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

CRITICAL: Each card type has specific required fields ONLY. Do not include extra fields from other card types:
- summary: ONLY {type, title, description, totalGames, averageScore, [optional: completionPercentage, totalPlaytime, rank]}
- platform_stats: ONLY {type, title, description, data: [{platform, count}, ...]}
- top_game: ONLY {type, title, description, game}
- genre_breakdown: ONLY {type, title, description, data: [{genre, count}, ...]}
- score_distribution: ONLY {type, title, description, data: [{range, count}, ...]} — "range" MUST be a short string representing the score range (e.g., "9-10", "90-100"). NO descriptions or extra text in range. "count" is a separate number.
- player_persona: ONLY {type, title, persona, description} — "persona" MUST be one of the exact strings from the list below.
- roast: ONLY {type, title, roast, trigger} — NO persona field, NO description field. This is a SEPARATE card from player_persona.
- recommendations: ONLY {type, title, recommendations}

1.  summary: A card with the total number of games and the average score. Always include this.
2.  platform_stats: A card with the distribution of games by platform.
3.  top_game: A card with the user's top-rated game. If many entries are unrated, infer a likely top pick using 'playtime' (highest is best), notes, completion status, or platform frequency.
4.  genre_breakdown: A card that analyzes the game titles and notes to show the user's most played genres.
5.  score_distribution: A chart that shows how many games fall into different score ranges. REQUIRED: "range" must be a short string representing the range (e.g. "9-10", "7-8" or "90-100", "70-89"). "count" must be the integer count. Do not include descriptive text or paragraphs in the range field.
6.  player_persona: Assigns a persona based on a holistic view of their gaming habits (including playtime and genres). See the Player Persona Taxonomy below and choose EXACTLY ONE persona. The "persona" field must match the name exactly.
7.  roast: Provide a sharp, witty, and slightly mean roast (1–2 sentences). Focus on specific habits like backlog hoarding (many games, 0 playtime), playing only one game forever, having terrible taste (high scores for bad games), or never finishing anything. Be a "tough love" critic. Do not hold back. IMPORTANT: A roast card is COMPLETELY SEPARATE from the player_persona card. Do NOT include persona fields in a roast card. Fields ONLY: type, title, roast, trigger.
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
    // Reviews are expected to be numeric-like strings (e.g. "7.5" or "0" for unrated), so we intentionally
    // avoid case normalization here.
    const normalizeScore = (value?: string) => (value ?? '').trim();
    const isMarked = (value?: string) => {
      const v = normalizeMarker(value);
      // HLTB exports use 'X', but accept a few common truthy markers to avoid skew from minor CSV variations.
      return v === 'X' || v === 'TRUE' || v === 'CHECK' || v === 'YES' || v === 'Y' || v === '1';
    };

    // Count rated games (assuming 'review' is the score field)
    // Filter out '0' scores as they typically represent unrated games in HLTB exports
    // Note: this intentionally matches the previous behavior (any non-empty, non-'0' review counts as "rated").
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
      const summaryCard = output.cards.find(c => c.type === 'summary') as z.infer<typeof CardSchema> | undefined;
      
      if (summaryCard) {
        // Determine rank based on total games
        const total = totalGames;
        let rank = "BRONZE";
        if (total > 100) rank = "MASTER";
        else if (total > 50) rank = "DIAMOND";
        else if (total > 25) rank = "PLATINUM";
        else if (total > 10) rank = "GOLD";
        else if (total > 5) rank = "SILVER";
        
        summaryCard.rank = rank;

        // Determine completion percentage if data exists
        if (completedGames > 0 && totalGames > 0) {
          summaryCard.completionPercentage = Math.round((completedGames / totalGames) * 100);
        }

        // Calculate total playtime
        const totalPlaytimeMinutes = games.reduce((acc, game) => {
          const minutes = typeof game.playtime === 'number' ? game.playtime : parseFloat(game.playtime || '0');
          return acc + (isNaN(minutes) ? 0 : minutes);
        }, 0);

        if (totalPlaytimeMinutes > 0) {
          summaryCard.totalPlaytime = totalPlaytimeMinutes;
        }
      }
    }

    return output!;
  }
);
