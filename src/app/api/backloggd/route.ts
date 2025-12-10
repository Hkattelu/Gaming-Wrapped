import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

async function fetchProfilePage(profileUrl: string, page: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const paginatedUrl = `${profileUrl}?page=${page}`;
    const response = await fetch(paginatedUrl, { signal: controller.signal });

    if (!response.ok) {
      // Pass through Backloggd's error status if possible
      return new NextResponse('Failed to fetch from Backloggd.', { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const gameEntries = $(".rating-hover");
    return { $, gameEntries };
  } catch (e: any) {
    console.error(`Error fetching page ${page} from ${profileUrl}:`, e);
    // Distinguish between timeout and other fetch errors
    if (e.name === 'AbortError') {
      return new NextResponse('Request to Backloggd timed out.', { status: 504 }); // 504 Gateway Timeout
    }
    return new NextResponse('Could not connect to Backloggd.', { status: 502 }); // 502 Bad Gateway
  } finally {
    clearTimeout(timeout);
  }
}

function extractGameData($: cheerio.CheerioAPI, gameEntries: cheerio.Cheerio<cheerio.Element>) {
  const gameData: { Title: string, Rating: string }[] = [];
  gameEntries.each((i, gameEntry) => {
    const $entry = $(gameEntry);
    const titleElement = $entry.find('.game-text-centered');
    const title = titleElement.text().trim() || 'Unknown Title';

    let rating = 0.0;
    const starsTopElement = $entry.find('.stars-top');
    if (starsTopElement.length) {
      const style = starsTopElement.attr("style") || "";
      const widthMatch = style.match(/width:\s*(\d+(\.\d+)?)%/);
      if (widthMatch) {
        rating = parseFloat(widthMatch[1]) / 20;
      }
    }

    if (rating === 0.0) {
      const gameCoverElement = $entry.find('[data-rating]').first();
      const dataRating = gameCoverElement.attr("data-rating");
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

  if (!username) {
    return new NextResponse('Username is required', { status: 400 });
  }

  const profileUrl = `https://backloggd.com/u/${username}/games/`;
  const allGameData: { Title: string, Rating: string }[] = [];
  let page = 1;

  while (true) {
    console.log(`Fetching page ${page} for ${username}...`);
    const result = await fetchProfilePage(profileUrl, page);

    // If result is an error response, bubble it up
    if (result instanceof NextResponse) {
      return result;
    }

    const { $, gameEntries } = result;

    if (gameEntries.length === 0) {
      console.log("No more game entries found. Wrapping up.");
      break;
    }

    const gameData = extractGameData($, gameEntries);
    allGameData.push(...gameData);
    page++;
  }

  if (allGameData.length === 0) {
    return new NextResponse('No game data found for this user. The username may be incorrect or the profile is private.', { status: 404 });
  }

  const headers = Object.keys(allGameData[0]);
  const csvRows = [
      headers.join(','),
      ...allGameData.map(row => headers.map(header => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`).join(','))
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