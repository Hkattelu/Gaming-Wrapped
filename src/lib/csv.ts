import { Game, BasicStats } from '@/types';

function toCamelCase(str: string): string {
  // Converts "Review Score" to "reviewscore"
  return str.trim().replace(/\s+/g, '').toLowerCase();
}

export function parseCsv(csvText: string): Game[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headerLine = lines.shift()!.trim();
    // More robustly handle headers that might be quoted
    const headers = headerLine.split(',').map(h => toCamelCase(h.replace(/"/g, '')));
    
    const titleIndex = headers.indexOf('title');
    const platformIndex = headers.indexOf('platform');
    // Accomodate different column names for score and notes
    const scoreIndex = headers.indexOf('reviewscore') > -1 ? headers.indexOf('reviewscore') : headers.indexOf('score');
    const notesIndex = headers.indexOf('reviewnotes') > -1 ? headers.indexOf('reviewnotes') : headers.indexOf('notes');

    if (titleIndex === -1 || platformIndex === -1) {
        throw new Error('CSV must contain "Title" and "Platform" headers.');
    }

    return lines.map(line => {
        // This is a simple parser and will not handle commas within quoted fields.
        // For data from sites like HowLongToBeat, this is usually sufficient.
        const values = line.split(',');
        
        const scoreRaw = scoreIndex > -1 ? values[scoreIndex]?.trim() : 'N/A';
        const score = isNaN(parseFloat(scoreRaw)) ? scoreRaw : parseFloat(scoreRaw);

        return {
            title: values[titleIndex]?.trim() || 'Untitled',
            platform: values[platformIndex]?.trim() || 'Unknown Platform',
            score: score,
            notes: notesIndex > -1 ? values.slice(notesIndex).join(',').trim() : '', // Handle commas in notes
        };
    }).filter(game => game.title && game.title !== 'Untitled');
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
