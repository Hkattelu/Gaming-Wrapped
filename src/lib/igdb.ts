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

export async function searchGameByTitle(title: string): Promise<{ url: string; slug: string } | null> {
  const sanitized = title.replace(/\n/g, ' ').slice(0, 120);
  const q = [
    'fields name, slug, url; ',
    `search "${sanitized}"; `,
    'limit 1;'
  ].join('');

  const result = await igdbRequest<Array<{ name: string; slug: string; url: string }>>('games', q);
  if (!result || result.length === 0) return null;
  const game = result[0];
  return game?.url ? { url: game.url, slug: game.slug } : null;
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

// In-memory TTL cache for top-of-year suggestions, keyed by requested year and
// the current UTC year-month (YYYY-MM). This ensures results are reused within
// the same calendar month and naturally refresh when the month rolls over.
type TopOfYearCacheEntry = { at: number; data: TopGameSuggestion[] };
const topOfYearCache = new Map<string, TopOfYearCacheEntry>();

// TTL for cached entries. Conservative default so results can refresh within
// a month if IGDB rankings meaningfully change.
const TOP_OF_YEAR_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function getTopGamesOfYear(year: number, limit = 8): Promise<TopGameSuggestion[] | null> {
  // Build a cache key that combines the requested UTC year with the current
  // UTC calendar year-month (YYYY-MM). We derive month in UTC to align with
  // the existing UTC-based year filtering and to avoid regional skew.
  const now = new Date();
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const cacheKey = `${year}:${ym}`;

  // Serve from cache when entry is fresh AND satisfies the requested limit.
  // If the cached list is shorter than the requested limit, treat as a miss so
  // that callers asking for more receive at least the requested number.
  const cached = topOfYearCache.get(cacheKey);
  if (cached && Date.now() - cached.at >= TOP_OF_YEAR_TTL_MS) {
    // Evict stale entries to prevent unbounded growth over time.
    topOfYearCache.delete(cacheKey);
  } else if (cached) {
    if (cached.data.length >= limit) {
      return cached.data.slice(0, limit);
    }
    // else: fall through to refetch with a larger limit
  }

  // IGDB timestamps are in seconds since epoch
  const start = Math.floor(new Date(Date.UTC(year, 0, 1, 0, 0, 0)).getTime() / 1000);
  const end = Math.floor(new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0)).getTime() / 1000);

  // Pull popular games released in the given year, require a cover to ensure good UX
  const q = [
    'fields name, cover.image_id, first_release_date, total_rating_count; ',
    `where first_release_date >= ${start} & first_release_date < ${end} & cover != null; `,
    'sort total_rating_count desc; ',
    // Use the requested limit (capped to 20). When refetching because the
    // cached list was shorter than requested, this ensures we fetch enough
    // items for the current caller.
    `limit ${Math.max(1, Math.min(limit, 20))};`
  ].join('');

  let rows = await igdbRequest<Array<{ name: string; cover?: { image_id: string } }>>('games', q);
  // Fallback: only when the primary query returned an empty array (not on null/error)
  if (Array.isArray(rows) && rows.length === 0) {
    const qFallback = [
      'fields name, cover.image_id, first_release_date, total_rating, total_rating_count; ',
      `where first_release_date >= ${start} & first_release_date < ${end} & cover != null; `,
      'sort total_rating desc; ',
      `limit ${Math.max(1, Math.min(limit, 20))};`
    ].join('');
    rows = await igdbRequest<Array<{ name: string; cover?: { image_id: string } }>>('games', qFallback) ?? [];
  }
  if (!rows || rows.length === 0) return null;
  const mapped = rows.map(r => ({
    title: r.name,
    imageUrl: r.cover?.image_id ? igdbImageUrl(r.cover.image_id, 'thumb') : null,
  }));

  // Update cache with the freshly fetched list and timestamp.
  topOfYearCache.set(cacheKey, { at: Date.now(), data: mapped });

  // Respect the requested limit on return.
  return mapped.slice(0, limit);
}
