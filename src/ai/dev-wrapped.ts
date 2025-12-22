import type { GenerateGamingWrappedOutput } from './flows/generate-gaming-wrapped';

export const MOCK_WRAPPED_OUTPUT: GenerateGamingWrappedOutput = {
  cards: [
    {
      type: 'summary',
      title: 'Your 2024 Gaming Journey',
      description: 'A year of epic adventures',
      totalGames: 10,
      averageScore: 8.8,
    },
    {
      type: 'platform_stats',
      title: 'Platform Breakdown',
      description: 'Where you played the most',
      data: [
        { platform: 'PC', count: 5 },
        { platform: 'Switch', count: 2 },
        { platform: 'PlayStation', count: 1 },
        { platform: 'Xbox', count: 1 },
      ],
    },
    {
      type: 'top_game',
      title: 'Game of the Year',
      description: 'Your highest-rated experience',
      game: {
        title: "Baldur's Gate 3",
        platform: 'PC',
        score: 10,
        notes: 'Best RPG ever made. My choices actually mattered.',
      },
    },
    {
      type: 'genre_breakdown',
      title: 'Genre Distribution',
      description: 'Your gaming tastes by genre',
      data: [
        { genre: 'RPG', count: 4 },
        { genre: 'Action', count: 2 },
        { genre: 'Simulation', count: 2 },
        { genre: 'Roguelike', count: 1 },
        { genre: 'Strategy', count: 1 },
      ],
    },
    {
      type: 'score_distribution',
      title: 'Rating Breakdown',
      description: 'How you scored your games',
      data: [
        { range: '9-10', count: 6 },
        { range: '7-8', count: 2 },
        { range: '5-6', count: 1 },
        { range: '3-4', count: 0 },
        { range: '0-2', count: 0 },
      ],
    },

    {
      type: 'narrative',
      title: 'Your Gaming Story',
      content: `This year, you embarked on **incredible journeys** across multiple worlds.

From the neon-lit streets of Night City to the mystical lands of the Forgotten Realms, you've proven yourself a true adventurer.

You didn't just play games—you *lived* them. 🎮`,
    },
    {
      type: 'player_persona',
      title: 'Your Player Persona',
      persona: 'The Completionist Explorer',
      description: 'You love diving deep into richly detailed worlds, exploring every corner and experiencing everything a game has to offer. You appreciate both story-driven RPGs and intricate simulation games.',
    },

    {
      type: 'roast',
      title: 'The Roast',
      roast: 'You gave Factorio a 10/10 and only marked it as "Played It"? The factory consumed your soul so completely you forgot what "finishing" a game even means. Also, dropping Starfield after calling it empty? Bold words from someone who spent 200 hours building digital conveyor belts.',
    },
    {
      type: 'recommendations',
      title: 'Games You Should Play Next',
      recommendations: [
        { game: 'Disco Elysium', blurb: 'For that deep RPG narrative itch' },
        { game: 'Satisfactory', blurb: 'Since the factory must grow (in 3D)' },
        { game: 'Hollow Knight', blurb: 'A challenging metroidvania masterpiece' },
        { game: 'The Witcher 3', blurb: 'If you somehow haven\'t played it yet' },
      ],
    },
  ],
};
