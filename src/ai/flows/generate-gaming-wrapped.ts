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
    playtime: z.coerce.number().optional().describe("Playtime in minutes"),
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
  ]).optional().describe('The player persona name'),
  
  // Roast card fields
  roast: z.string().optional(),
  trigger: z.string().optional(),
  
  // Data array fields (platform_stats, genre_breakdown, score_distribution)
  data: z.array(z.object({
    platform: z.string().optional(),
    genre: z.string().optional(),
    range: z.string().optional().describe("Score range (e.g. '9-10', '90-100'). NO descriptions."),
    count: z.number().describe("The integer count for this category. MANDATORY."),
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

const GenerateGamingWrappedFlowSchema = z.array(CardSchema);

export type GenerateGamingWrappedOutput = {
  cards: z.infer<typeof CardSchema>[];
};

export async function generateGamingWrapped(input: GenerateGamingWrappedInput): Promise<GenerateGamingWrappedOutput> {
  if (process.env.NODE_ENV !== 'production' && process.env.USE_MOCK_WRAPPED_OUTPUT === 'true') {
    return MOCK_WRAPPED_OUTPUT;
  }
  const result = await generateGamingWrappedFlow(input);
  return { cards: result ?? [] };
}

const prompt = ai.definePrompt({
  name: 'generateGamingWrappedPrompt',
  input: { schema: z.object({ games: z.string(), context: z.string() }) },
  output: { schema: GenerateGamingWrappedFlowSchema },
  prompt: `You are a creative storyteller who specializes in generating personalized gaming history summaries.

Analyze the following gaming data and create a fun and engaging "Gaming Wrapped" in the form of a series of cards.

{{context}}

=====
Gaming Data: {{games}}
=====

## Instructions

Generate a JSON array of cards. Each card in the array should be one of the following types. 
IMPORTANT: Adhere strictly to the "Context" instructions above regarding which cards to include or exclude.

CRITICAL: Each card type has specific required fields ONLY. Do not include extra fields from other card types:
- summary: ONLY {type, title, description, totalGames, averageScore, [optional: completionPercentage, totalPlaytime, rank]}
- platform_stats: ONLY {type, title, description, data: [{platform, count}, ...]}}
- top_game: ONLY {type, title, description, game}
- genre_breakdown: ONLY {type, title, description, data: [{genre, count}, ...]}}
- score_distribution: ONLY {type, title, description, data: [{range, count}, ...]} — "range" MUST be a short string representing the score range (e.g., "9-10", "90-100"). NO descriptions or extra text in range. "count" is a separate number.
- player_persona: ONLY {type, title, persona} — "persona" MUST be one of the exact strings from the list below. 
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
- persona: Must be exactly one of the names below (descriptions are handled by the client).

Personas:
- The Loyal Legend — For the player who dedicates hundreds of hours to a single game.
- The Platinum Plunderer — For the player who is a dedicated achievement hunter and completionist.
- The Squadron Leader — For the player who primarily plays co-op and multiplayer games with friends.
- The Narrative Navigator — For the player who loves deep, story-driven, single-player experiences.
- The Apex Predator — For the player who thrives in competitive, high-stakes, ranked gameplay.
- The Cozy Cultivator — For the player who enjoys relaxing, low-stakes games like farming sims and life sims.
- The Artisan Adventurer — For the player who predominantly plays and discovers unique indie titles.
- The Master Architect — For the player who loves building, management, and strategy games.
- The High-Octane Hero — For the player who loves fast-paced, non-stop action games.
- The Vanguard Gamer — For the player who is always playing the newest, hottest releases.
- The Backlog Baron — For the player with hundreds of games but only a handful played.
- The Digital Hoarder — For the player who plays a little bit of everything but finishes nothing.
- The Completionist Cultist — For the player who doesn't just play games, they colonize them.
- The Early Access Enthusiast — For the player who lives on the bleeding edge of bugs and unfinished features.
- The Diamond in the Rough Digger — For the player who finds beauty in the underrated.
- The Speedrun Sorcerer — For the player who views games as obstacle courses.
- The Modded Maestro — For the player who doesn't play the game; they play the 400 mods they installed.
- The Digital Monogamist — For the player who marries one game and treats all others like side-flings.
  `
});

const generateGamingWrappedFlow = ai.defineFlow(
  {
    name: 'generateGamingWrappedFlow',
    inputSchema: GenerateGamingWrappedInputSchema,
    outputSchema: GenerateGamingWrappedFlowSchema,
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
    if (output) {
      const summaryCard = output.find(c => c.type === 'summary') as z.infer<typeof CardSchema> | undefined;
      
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
