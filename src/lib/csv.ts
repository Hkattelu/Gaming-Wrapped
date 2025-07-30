import { Game } from '@/types';
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