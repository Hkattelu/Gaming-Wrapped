import type { NextRequest } from 'next/server';

// Simple, in-memory cache for the Twitch App access token used with IGDB
let cachedToken: { value: string; expiresAt: number } | null = null;

async function fetchTwitchAppToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  // Reuse cached token if still valid (with a small safety window)
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.value;
  }

  try {
    const resp = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!resp.ok) {
      console.error('Failed to fetch Twitch token:', await resp.text());
      return null;
    }

    const data = (await resp.json()) as { access_token: string; expires_in: number };
    cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return cachedToken.value;
  } catch (err) {
    console.error('Error fetching Twitch token:', err);
    return null;
  }
}

async function igdbRequest<T>(endpoint: 'games' | 'covers', query: string): Promise<T | null> {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) return null;

  const doFetch = async () => {
    const token = await fetchTwitchAppToken();
    if (!token) return null;
    return fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: query,
      // IGDB requires text body, not JSON
    });
  };

  let resp = await doFetch();
  if (!resp) return null;

  // If the token is invalid/expired, clear cache and retry once
  if (resp.status === 401 || resp.status === 403) {
    cachedToken = null;
    resp = await doFetch();
    if (!resp) return null;
  }

  if (!resp.ok) {
    console.error('IGDB API error:', endpoint, await resp.text());
    return null;
  }

  return (await resp.json()) as T;
}

export function igdbImageUrl(imageId: string, size: 'thumb' | 'cover_small' | 'cover_big' = 'thumb'): string {
  // See https://api-docs.igdb.com/#images for available sizes
  const map: Record<string, string> = {
    thumb: 't_thumb',
    cover_small: 't_cover_small',
    cover_big: 't_cover_big',
  };
  const type = map[size] ?? 't_thumb';
  return `https://images.igdb.com/igdb/image/upload/${type}/${imageId}.jpg`;
}

export async function searchCoverByTitle(title: string): Promise<string | null> {
  // Prefer searching games and asking for nested cover.image_id in one call
  const sanitized = title.replace(/\n/g, ' ').slice(0, 120);
  const q = [
    'fields name, cover.image_id; ',
    `search "${sanitized}"; `,
    'where cover != null; ',
    'limit 1;'
  ].join('');

  const result = await igdbRequest<Array<{ name: string; cover?: { image_id: string } }>>('games', q);
  if (!result || result.length === 0) return null;
  const coverId = result[0]?.cover?.image_id;
  return coverId ? igdbImageUrl(coverId, 'thumb') : null;
}

export interface TopGameSuggestion {
  title: string;
  imageUrl: string | null;
}

export async function getTopGamesOfYear(year: number, limit = 8): Promise<TopGameSuggestion[] | null> {
  // IGDB timestamps are in seconds since epoch
  const start = Math.floor(new Date(Date.UTC(year, 0, 1, 0, 0, 0)).getTime() / 1000);
  const end = Math.floor(new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0)).getTime() / 1000);

  // Pull popular games released in the given year, require a cover to ensure good UX
  const q = [
    'fields name, cover.image_id, first_release_date, total_rating_count, popularity; ',
    `where first_release_date >= ${start} & first_release_date < ${end} & cover != null; `,
    'sort total_rating_count desc; ',
    `limit ${Math.max(1, Math.min(limit, 20))};`
  ].join('');

  const rows = await igdbRequest<Array<{ name: string; cover?: { image_id: string } }>>('games', q);
  if (!rows) return null;
  return rows.map(r => ({ title: r.name, imageUrl: r.cover?.image_id ? igdbImageUrl(r.cover.image_id, 'thumb') : null }));
}
