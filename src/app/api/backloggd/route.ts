import { NextRequest, NextResponse } from 'next/server';
import { sanitizeCsvField } from '@/lib/csv';
import { load, CheerioAPI, Cheerio } from 'cheerio';
import type { AnyNode } from 'domhandler';
import { isTag } from 'domutils';

export const maxDuration = 300; // 5 minutes for Vercel
export const dynamic = 'force-dynamic';

const MAX_PAGES = 100;
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay between requests

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchResult =
  | { success: true; $: CheerioAPI; gameEntries: Cheerio<AnyNode> }
  | { success: false; error: string; status: number };

async function fetchProfilePage(profileUrl: string, page: number): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const paginatedUrl = `${profileUrl}?page=${page}`;
    const response = await fetch(paginatedUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { success: false, error: 'Rate limited by Backloggd. Please try again in a few minutes.', status: 429 };
      }
      return { success: false, error: 'Failed to fetch from Backloggd.', status: response.status };
    }

    const html = await response.text();
    const $ = load(html);
    const gameEntries = $('.rating-hover');
    return { success: true, $, gameEntries };
  } catch (e: unknown) {
    console.error(`Error fetching page ${page} from ${profileUrl}:`, e);
    if (e instanceof Error && e.name === 'AbortError') {
      return { success: false, error: 'Request to Backloggd timed out.', status: 504 };
    }
    return { success: false, error: 'Could not connect to Backloggd.', status: 502 };
  } finally {
    clearTimeout(timeout);
  }
}

function extractGameData(
  $: CheerioAPI,
  gameEntries: Cheerio<AnyNode>,
): { Title: string; Rating: string }[] {
  const gameData: { Title: string; Rating: string }[] = [];
  const seenTitles = new Set<string>();

  gameEntries.each((_, gameEntry) => {
    if (!isTag(gameEntry)) {
      return;
    }

    const $entry = $(gameEntry);
    const titleElement = $entry.find('.game-text-centered');
    const title = titleElement.text().trim() || 'Unknown Title';

    // Skip if we've seen this title before (duplicate detection)
    if (seenTitles.has(title)) {
      return;
    }
    seenTitles.add(title);

    let rating = 0.0;
    const starsTopElement = $entry.find('.stars-top');
    const style = starsTopElement.attr('style') || '';
    const widthMatch = style.match(/width:\s*(\d+(\.\d+)?)%/);
    if (widthMatch) {
      rating = parseFloat(widthMatch[1]) / 20;
    }

    if (rating === 0.0) {
      const gameCoverElement = $entry.find('[data-rating]').first();
      const dataRating = gameCoverElement.attr('data-rating');
      if (dataRating) {
        rating = parseFloat(dataRating) / 2;
      }
    }

    gameData.push({ Title: title, Rating: rating.toFixed(1) });
  });

  return gameData;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  const stream = searchParams.get('stream') === 'true';

  if (!username) {
    return new NextResponse('Username is required', { status: 400 });
  }

  // Validate username to prevent injection/malformed URLs
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return new NextResponse('Invalid username format. Use only alphanumeric characters, underscores, periods, and hyphens.', { status: 400 });
  }

  const profileUrl = `https://backloggd.com/u/${username}/games/added:desc/type:played/`;
  const allGameData: { Title: string; Rating: string }[] = [];
  const seenTitlesGlobal = new Set<string>();

  // If streaming is requested, use SSE for progress updates
  if (stream) {
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          let consecutiveDuplicatePages = 0;
          
          for (let page = 1; page <= MAX_PAGES; page++) {
            
            // Send progress update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'progress', page, total: allGameData.length })}\n\n`)
            );

            const result = await fetchProfilePage(profileUrl, page);

            if (!result.success) {
              if (result.status === 429 && allGameData.length > 0) {
                break;
              }
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'error', error: result.error })}\n\n`)
              );
              controller.close();
              return;
            }

            const { $, gameEntries } = result;

            if (gameEntries.length === 0) {
              break;
            }

            const gameData = extractGameData($, gameEntries);
            
            // Check for duplicates across all pages
            let newGamesCount = 0;
            for (const game of gameData) {
              if (!seenTitlesGlobal.has(game.Title)) {
                seenTitlesGlobal.add(game.Title);
                allGameData.push(game);
                newGamesCount++;
              }
            }
            
            
            // If we got no new games, we might be seeing repeats
            if (newGamesCount === 0) {
              consecutiveDuplicatePages++;
              
              // If we see 2 pages in a row with no new games, we're probably done
              if (consecutiveDuplicatePages >= 2) {
                break;
              }
            } else {
              consecutiveDuplicatePages = 0;
            }

            if (page < MAX_PAGES) {
              await delay(DELAY_BETWEEN_REQUESTS);
            }
          }


          if (allGameData.length === 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'No game data found' })}\n\n`)
            );
            controller.close();
            return;
          }

          const headers = Object.keys(allGameData[0]);
          const csvRows = [
            headers.join(','),
            ...allGameData.map((row) =>
              headers
                .map((header) => sanitizeCsvField(row[header as keyof typeof row]))
                .join(','),
            ),
          ];
          const csvString = csvRows.join('\n');

          // Send completion with CSV data
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', csv: csvString, total: allGameData.length })}\n\n`)
          );
          controller.close();
        } catch {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'An error occurred' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new NextResponse(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  // Non-streaming fallback (original behavior)
  let consecutiveDuplicatePages = 0;
  
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await fetchProfilePage(profileUrl, page);

    if (!result.success) {
      if (result.status === 429 && allGameData.length > 0) {
        break;
      }
      return new NextResponse(result.error, { status: result.status });
    }

    const { $, gameEntries } = result;

    if (gameEntries.length === 0) {
      break;
    }

    const gameData = extractGameData($, gameEntries);
    
    // Check for duplicates across all pages
    let newGamesCount = 0;
    for (const game of gameData) {
      if (!seenTitlesGlobal.has(game.Title)) {
        seenTitlesGlobal.add(game.Title);
        allGameData.push(game);
        newGamesCount++;
      }
    }
    
    
    // If we got no new games, we might be seeing repeats
    if (newGamesCount === 0) {
      consecutiveDuplicatePages++;
      
      // If we see 2 pages in a row with no new games, we're probably done
      if (consecutiveDuplicatePages >= 2) {
        break;
      }
    } else {
      consecutiveDuplicatePages = 0;
    }

    if (page < MAX_PAGES) {
      await delay(DELAY_BETWEEN_REQUESTS);
    }
  }


  if (allGameData.length === 0) {
    return new NextResponse(
      'No game data found for this user. The username may be incorrect or the profile is private.',
      { status: 404 },
    );
  }

  const headers = Object.keys(allGameData[0]);
  const csvRows = [
    headers.join(','),
    ...allGameData.map((row) =>
      headers
        .map((header) => sanitizeCsvField(row[header as keyof typeof row]))
        .join(','),
    ),
  ];
  const csvString = csvRows.join('\n');


  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${username}_games.csv"`,
    },
  });
}
