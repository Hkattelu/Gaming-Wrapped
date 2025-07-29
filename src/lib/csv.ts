import { Game, BasicStats } from '@/types';
import Papa from 'papaparse';

function toCamelCase(str: string): string {
  // Converts "Review Score" to "reviewscore"
  return str.trim().replace(/\s+/g, '').toLowerCase();
}

export function parseCsv(csvText: string): Game[] {
  let games: Game[] = [];
  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: header => toCamelCase(header),
    complete: (results) => {
      if (results.errors.length) {
        console.error("Errors parsing CSV:", results.errors);
        throw new Error('Error parsing CSV file.');
      }
      
      const requiredHeaders = ['title', 'platform'];
      const actualHeaders = results.meta.fields?.map(h => toCamelCase(h));
      
      if (!requiredHeaders.every(h => actualHeaders?.includes(h))) {
        throw new Error('CSV must contain "Title" and "Platform" headers.');
      }

      games = results.data.map((row: any) => {
        const scoreRaw = row.reviewscore || row.score || 'N/A';
        const score = isNaN(parseFloat(scoreRaw)) ? scoreRaw : parseFloat(scoreRaw);
        
        return {
          title: row.title || 'Untitled',
          platform: row.platform || 'Unknown Platform',
          score: score,
          notes: row.reviewnotes || row.notes || '',
        };
      }).filter(game => game.title && game.title !== 'Untitled');
    }
  });
  return games;
}


export function calculateStats(games: Game[]): BasicStats {
  if (games.length === 0) {
    return {
      totalGames: 0,
      averageScore: 0,
      topGame: null,
      platformDistribution: [],
    };
  }

  const scores = games
    .map(g => typeof g.score === 'number' ? g.score : NaN)
    .filter(s => !isNaN(s));
  
  const averageScore = scores.length > 0 ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;

  let topGame: Game | null = null;
  if(scores.length > 0) {
    const maxScore = Math.max(...scores);
    // Find the first game with the max score
    topGame = games.find(g => g.score === maxScore) || null;
  } else {
    // If no games have scores, pick the first game
    topGame = games[0] || null;
  }

  const platformCounts = games.reduce((acc, game) => {
    const platform = game.platform || 'Unknown';
    acc[platform] = (acc[platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformDistribution = Object.entries(platformCounts)
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalGames: games.length,
    averageScore,
    topGame,
    platformDistribution,
  };
}
