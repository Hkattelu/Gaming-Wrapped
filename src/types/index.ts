export interface Game {
  title: string;
  platform: string;
  score: number | string; // Can be number or string like 'N/A'
  notes: string;
}

export interface BasicStats {
    totalGames: number;
    averageScore: number;
    topGame: Game | null;
    platformDistribution: { platform: string; count: number }[];
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

export type WrappedCard = PlatformStatsCard | TopGameCard | SummaryCard | NarrativeCard;


export interface WrappedData {
  cards: WrappedCard[];
}
