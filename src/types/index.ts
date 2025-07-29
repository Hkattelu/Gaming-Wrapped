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
  platformDistribution: { platform: string, count: number }[];
}

export interface AiResponse {
  narrative: string;
  keyStats: string;
}

export interface WrappedData {
  basicStats: BasicStats;
  aiResponse: AiResponse;
}
