import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const STEAM_API_KEY = process.env.STEAM_API_KEY;

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  has_community_visible_stats?: boolean;
}

interface OwnedGamesResponse {
  response: {
    game_count: number;
    games: SteamGame[];
  };
}

async function fetchOwnedGames(steamId: string): Promise<OwnedGamesResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      console.error(`Steam API returned status ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (e: unknown) {
    console.error('Error fetching Steam games:', e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const steamId = searchParams.get('steamId');
  const stream = searchParams.get('stream') === 'true';

  if (!STEAM_API_KEY) {
    return new NextResponse('Steam API key not configured', { status: 500 });
  }

  if (!steamId) {
    return new NextResponse('Steam ID is required', { status: 400 });
  }

  if (stream) {
    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: 'Fetching games from Steam...' })}\n\n`)
          );

          const data = await fetchOwnedGames(steamId);

          if (!data || !data.response || !data.response.games) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Could not fetch games. Make sure your Steam ID is correct and your game details are public.' })}\n\n`)
            );
            controller.close();
            return;
          }

          const games = data.response.games;

          if (games.length === 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'No games found. Your profile may be private or you have no games.' })}\n\n`)
            );
            controller.close();
            return;
          }

          const gameData = games
            .filter((game) => game.playtime_forever > 0)
            .map((game) => ({
              Title: game.name,
              Rating: '',
              PlaytimeMinutes: game.playtime_forever,
            }));

          if (gameData.length === 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'No played games found in your library.' })}\n\n`)
            );
            controller.close();
            return;
          }

          const headers = ['Title', 'Rating', 'PlaytimeMinutes'];
          const csvRows = [
            headers.join(','),
            ...gameData.map((row) =>
              headers
                .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
                .join(','),
            ),
          ];
          const csvString = csvRows.join('\n');

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'complete', csv: csvString, total: gameData.length })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Steam API streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'An error occurred while fetching Steam data.' })}\n\n`)
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

  const data = await fetchOwnedGames(steamId);

  if (!data || !data.response || !data.response.games) {
    return new NextResponse(
      'Could not fetch games. Make sure your Steam ID is correct and your game details are public.',
      { status: 404 },
    );
  }

  const games = data.response.games;

  if (games.length === 0) {
    return new NextResponse(
      'No games found. Your profile may be private or you have no games.',
      { status: 404 },
    );
  }

  const gameData = games
    .filter((game) => game.playtime_forever > 0)
    .map((game) => ({
      Title: game.name,
      Rating: '',
      PlaytimeMinutes: game.playtime_forever,
    }));

  if (gameData.length === 0) {
    return new NextResponse('No played games found in your library.', { status: 404 });
  }

  const headers = ['Title', 'Rating', 'PlaytimeMinutes'];
  const csvRows = [
    headers.join(','),
    ...gameData.map((row) =>
      headers
        .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
        .join(','),
    ),
  ];
  const csvString = csvRows.join('\n');

  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="steam_${steamId}_games.csv"`,
    },
  });
}
