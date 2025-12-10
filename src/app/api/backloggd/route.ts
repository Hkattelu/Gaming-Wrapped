import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

async function fetchProfilePage(profileUrl: string, page: number) {
  try {
    const paginatedUrl = `${profileUrl}?page=${page}`;
    const response = await fetch(paginatedUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const gameEntries = $(".rating-hover");
    return gameEntries;
  } catch (e) {
    console.error(`Error fetching page ${page}: ${e}`);
    return null;
  }
}

function extractGameData(gameEntries: cheerio.Cheerio<cheerio.Element>) {
  const gameData: { Title: string, Rating: string }[] = [];
  gameEntries.each((i, gameEntry) => {
    const $ = cheerio.load(gameEntry);
    const titleElement = $(".game-text-centered");
    const title = titleElement ? titleElement.text().trim() : "Unknown Title";

    let rating = 0.0;
    const starsTopElement = $(".stars-top");
    if (starsTopElement) {
      const style = starsTopElement.attr("style") || "";
      const widthMatch = style.match(/width:\s*(\d+(\.\d+)?)%/);
      if (widthMatch) {
        rating = parseFloat(widthMatch[1]) / 20;
      }
    }

    if (rating === 0.0) {
      const gameCoverElement = $("[data-rating]");
      if (gameCoverElement) {
        const dataRating = gameCoverElement.attr("data-rating");
        if (dataRating) {
          rating = parseFloat(dataRating) / 2;
        }
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
  let previousPageDataHash = null;

  while (true) {
    console.log(`Fetching page ${page} for ${username}...`);
    const gameEntries = await fetchProfilePage(profileUrl, page);

    if (!gameEntries || gameEntries.length === 0) {
      console.log("No more game entries found. Wrapping up.");
      break;
    }

    const gameData = extractGameData(gameEntries);
    const currentPageDataHash = JSON.stringify(gameData);

    if (currentPageDataHash === previousPageDataHash) {
        console.log("Duplicate page data found. Stopping scraping.");
        break;
    }

    allGameData.push(...gameData);
    previousPageDataHash = currentPageDataHash;
    page++;
  }

  if (allGameData.length === 0) {
    return new NextResponse('No game data found for this user.', { status: 404 });
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