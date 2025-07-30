export interface Game {
  title: string;
  platform: string;
  score: number | string; // Can be number or string like 'N/A'
  notes: string;
}

// Card types that the AI can generate
export interface PlatformStatsCard {
  type: 'platform_stats';
  title: string;
  description: string;
  data: { platform: string; count: number }[];
}

export interface TopGameCard {
  type: 'top_game';
  title: string;
  description: string;
  game: Game;
}

export interface SummaryCard {
  type: 'summary';
  title: string;
  description: string;
  totalGames: number;
  averageScore: number;
}

export interface NarrativeCard {
  type: 'narrative';
  title: string;
  content: string;
}

export type WrappedCard = PlatformStatsCard | TopGameCard | SummaryCard | NarrativeCard | GenreBreakdownCard | ScoreDistributionCard | HiddenGemCard;

export interface GenreBreakdownCard {
  type: 'genre_breakdown';
  title: string;
  description: string;
  data: { genre: string; count: number }[];
}

export interface ScoreDistributionCard {
  type: 'score_distribution';
  title: string;
  description: string;
  data: { range: string; count: number }[];
}

export interface HiddenGemCard {
  type: 'hidden_gem';
  title: string;
  description: string;
  game: Game;
}

export interface StoryIdentifier {
  id: string;
}

export interface WrappedData {
  cards: WrappedCard[];
}
