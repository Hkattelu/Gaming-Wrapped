import type { GenerateGamingWrappedOutput } from './flows/generate-gaming-wrapped';

export const MOCK_WRAPPED_OUTPUT: GenerateGamingWrappedOutput = {
  cards: [
    {
      type: 'summary',
      title: '2025 Gaming Wrapped',
      description: 'Your year in pixels and polygons',
      totalGames: 24,
      averageScore: 8.2,
      completionPercentage: 67,
      totalPlaytime: 18240, // 304 hours in minutes
      rank: 'GOLD',
    },
    {
      type: 'platform_stats',
      title: 'Platform Wars',
      description: 'Your multi-platform journey',
      data: [
        { platform: 'PC', count: 12 },
        { platform: 'PS5', count: 7 },
        { platform: 'Switch', count: 3 },
        { platform: 'Xbox Series X', count: 2 },
      ],
    },
    {
      type: 'top_game',
      title: 'Game of the Year',
      description: 'Your highest-rated masterpiece',
      game: {
        title: "Elden Ring",
        platform: 'PC',
        score: 10,
        formattedScore: '10/10',
        notes: 'Absolute perfection. Every boss fight felt earned, every discovery was magical. Spent 120 hours and still finding new secrets. GOTY without question.',
      },
    },
    {
      type: 'genre_breakdown',
      title: 'Genre Analysis',
      description: 'Breaking down your gaming DNA',
      data: [
        { genre: 'Action RPG', count: 7 },
        { genre: 'Roguelike', count: 5 },
        { genre: 'Strategy', count: 4 },
        { genre: 'Horror', count: 3 },
        { genre: 'Platformer', count: 3 },
        { genre: 'Puzzle', count: 2 },
      ],
    },
    {
      type: 'score_distribution',
      title: 'Your Ratings Breakdown',
      description: 'How critical were you this year?',
      data: [
        { range: '9-10', count: 8 },
        { range: '7-8', count: 11 },
        { range: '5-6', count: 4 },
        { range: '3-4', count: 1 },
        { range: '0-2', count: 0 },
      ],
    },
    {
      type: 'player_persona',
      title: 'Your Player Persona',
      persona: 'The Completionist Cultist',
    },
    {
      type: 'roast',
      title: 'Time for Your Roast',
      roast: 'You played 5 different roguelikes this year and somehow convinced yourself each run was "just one more try." 120 hours in Elden Ring and you STILL summoned for Malenia. Also, rating Hades 2 a 9/10 because "it\'s not as good as the first one" is the most pretentious thing I\'ve ever seen. You literally gave a masterpiece a lower score out of spite.',
      trigger: 'Trigger: 287 failed roguelike runs / Summoned spirit ashes on final boss',
    },
    {
      type: 'recommendations',
      title: 'Your 2026 Must-Play List',
      recommendations: [
        { game: 'Lies of P', blurb: 'Dark Souls meets Pinocchio. Trust us, it works.' },
        { game: 'Sekiro: Shadows Die Twice', blurb: 'You claim to love Souls games but skipped this? Shame.' },
        { game: 'Returnal', blurb: 'Roguelike meets bullet hell. Your two favorite things combined.' },
        { game: 'Hollow Knight: Silksong', blurb: 'When it finally releases... if it releases... please release...' },
      ],
    },
  ],
};
