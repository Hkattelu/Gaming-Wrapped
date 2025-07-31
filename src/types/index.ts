export interface Game {
  title: string;
  platform: string;
  score: number | string; // Can be number or string like 'N/A'
  notes: string;
}

export interface ManualGame {
  id: string; // client-side only
  title: string;
  platform: string;
  status: string; // e.g., 'Finished', 'Completed', 'Dropped'
  score: string;
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

export interface PlayerPersonaCard {
  type: 'player_persona';
  title: string;
  persona: string;
  description: string;
}

export interface GamerAlignmentCard {
  type: 'gamer_alignment';
  title: string;
  alignment: string;
  description: string;
}

export interface RoastCard {
  type: 'roast';
  title: string;
  roast: string;
}

export interface RecommendationsCard {
  type: 'recommendations';
  title: string;
  recommendations: string[];
}

export interface GamingSpiritAnimalCard {
  type: 'gaming_spirit_animal';
  title: string;
  animal: string;
  description: string;
}

export type WrappedCard = 
  | PlatformStatsCard 
  | TopGameCard 
  | SummaryCard 
  | NarrativeCard 
  | GenreBreakdownCard 
  | ScoreDistributionCard 
  | HiddenGemCard
  | PlayerPersonaCard
  | GamerAlignmentCard
  | RoastCard
  | RecommendationsCard
  | GamingSpiritAnimalCard;

export interface StoryIdentifier {
  id: string;
}

export interface WrappedData {
  cards: WrappedCard[];
}
