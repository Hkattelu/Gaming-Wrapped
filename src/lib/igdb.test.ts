import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// We'll import the module fresh in each test to reset the in-memory token cache
const IGDB_MODULE_PATH = '@/lib/igdb';

const ORIGINAL_ENV = process.env;

function mockFetchSequence(
  impls: Array<(input: RequestInfo, init?: RequestInit) => Promise<unknown>>
): typeof fetch {
  const fn = jest.fn();
  impls.forEach((impl) => {
    fn.mockImplementationOnce(impl as unknown as jest.Mock);
  });
  return fn as unknown as typeof fetch;
}

describe('lib/igdb integration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('fetchTwitchAppToken: returns null when required env vars are missing (covered via exported APIs)', async () => {
    process.env.TWITCH_CLIENT_ID = '';
    process.env.TWITCH_CLIENT_SECRET = '';

    // No network calls should be attempted
    global.fetch = jest.fn() as unknown as typeof fetch;

    const { searchCoverByTitle } = await import(IGDB_MODULE_PATH);
    const res = await searchCoverByTitle('Halo');
    expect(res).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetchTwitchAppToken: caches the token until expiry with a 60s safety window (covered via searchCoverByTitle)', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';

    // Fix time so cache logic is deterministic
    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValue(0);

    // 1) Token fetch (200) → {access_token: 't1', expires_in: 300}
    // 2) IGDB call (200)
    // 3) IGDB call again (should NOT refetch token because not within the 60s window)
    const tokenResp = { access_token: 't1', expires_in: 300 };
    const gameRows = [{ name: 'Halo', cover: { image_id: 'abc123' } }];
    const fetchMock = mockFetchSequence([
      // Token endpoint
      async (input: RequestInfo) => {
        expect(String(input)).toContain('https://id.twitch.tv/oauth2/token');
        return { ok: true, json: async () => tokenResp } as unknown as Response;
      },
      // First IGDB request
      async (input: RequestInfo, init?: RequestInit) => {
        expect(String(input)).toContain('https://api.igdb.com/v4/games');
        // Assert headers present on first call
        const headers = (init as unknown as { headers?: Record<string, string> })?.headers ?? {};
        expect(headers['Client-ID']).toBe('abc');
        expect(headers['Authorization']).toBe('Bearer t1');
        expect(headers['Accept']).toBe('application/json');
        return { ok: true, json: async () => gameRows } as unknown as Response;
      },
      // Second IGDB request (no new token request expected)
      async (input: RequestInfo) => {
        expect(String(input)).toContain('https://api.igdb.com/v4/games');
        return { ok: true, json: async () => gameRows } as unknown as Response;
      },
    ]);
    global.fetch = fetchMock;

    const { searchCoverByTitle } = await import(IGDB_MODULE_PATH);
    const url1 = await searchCoverByTitle('Halo');
    const url2 = await searchCoverByTitle('Halo 2\nAnniversary');
    expect(fetchMock).toHaveBeenCalledTimes(3); // 1 token + 2 IGDB
    expect(url1).toMatch(/^https:\/\/images\.igdb\.com\/igdb\/image\/upload\/t_cover_big\//);
    expect(url2).toMatch(/^https:\/\/images\.igdb\.com\/igdb\/image\/upload\/t_cover_big\//);

    // Advance time close to expiry: expires_at = 300s; safety window is 60s → token becomes invalid when now >= 240s
    nowSpy.mockReturnValue(250_000);
    // Next call should trigger a new token fetch before hitting IGDB
    (global.fetch as unknown as jest.Mock).mockImplementationOnce(async (input: any) => {
      expect(String(input)).toContain('https://id.twitch.tv/oauth2/token');
      return { ok: true, json: async () => ({ access_token: 't2', expires_in: 300 }) } as unknown as Response;
    });
    (global.fetch as unknown as jest.Mock).mockImplementationOnce(async () => ({ ok: true, json: async () => gameRows }) as unknown as Response);

    const url3 = await (await import(IGDB_MODULE_PATH)).searchCoverByTitle('Halo Infinite');
    expect(url3).toMatch(/^https:\/\/images\.igdb\.com\/igdb\/image\/upload\/t_cover_big\//);
    // Now total calls: 3 previous + 2 more (new token + IGDB)
    expect((global.fetch as unknown as jest.Mock).mock.calls.length).toBe(5);
  });

  it('fetchTwitchAppToken: returns null on non-OK Twitch token response (covered via getTopGamesOfYear)', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';

    global.fetch = jest.fn(async (input: unknown) => {
      // Token endpoint fails
      if (String(input).includes('https://id.twitch.tv/oauth2/token')) {
        return { ok: false, text: async () => 'bad' } as unknown as Response;
      }
      throw new Error('Unexpected fetch: ' + input);
    }) as unknown as typeof fetch;

    const { getTopGamesOfYear } = await import(IGDB_MODULE_PATH);
    const res = await getTopGamesOfYear(2025, 8);
    expect(res).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('igdbRequest: includes required headers and POST body equals provided query (covered via searchCoverByTitle)', async () => {
    process.env.TWITCH_CLIENT_ID = 'client-x';
    process.env.TWITCH_CLIENT_SECRET = 'secret-y';

    const tokenResp = { access_token: 'tok', expires_in: 300 };
    const rows = [{ name: 'A', cover: { image_id: 'img' } }];

    const calls: Array<{ url: string; init?: RequestInit }> = [];
    global.fetch = jest.fn(async (input: unknown, init?: unknown) => {
      calls.push({ url: String(input), init: init as RequestInit | undefined });
      if (String(input).includes('oauth2/token')) return { ok: true, json: async () => tokenResp } as unknown as Response;
      return { ok: true, json: async () => rows } as unknown as Response;
    }) as unknown as typeof fetch;

    const { searchCoverByTitle } = await import(IGDB_MODULE_PATH);
    await searchCoverByTitle('My Game\nWith Newline');

    expect(calls.length).toBe(2);
    const igdb = calls[1];
    expect(igdb.url).toBe('https://api.igdb.com/v4/games');
    const headers = (igdb.init?.headers ?? {}) as unknown as Record<string, string>;
    expect(headers['Client-ID']).toBe('client-x');
    expect(headers['Authorization']).toBe('Bearer tok');
    expect(headers['Accept']).toBe('application/json');
    expect(igdb.init?.method).toBe('POST');
    // Body should be a string containing a sanitized search clause and where cover != null
    const body = String(igdb.init?.body ?? '');
    expect(body).toContain('fields name, cover.image_id;');
    expect(body).toContain('search "My Game With Newline";');
    expect(body).toContain('where cover != null;');
  });

  it('igdbImageUrl: builds correct URLs for supported sizes', async () => {
    const { igdbImageUrl } = await import(IGDB_MODULE_PATH);
    expect(igdbImageUrl('abc', 'thumb')).toBe('https://images.igdb.com/igdb/image/upload/t_thumb/abc.jpg');
    expect(igdbImageUrl('xyz', 'cover_small')).toBe('https://images.igdb.com/igdb/image/upload/t_cover_small/xyz.jpg');
    expect(igdbImageUrl('qwe', 'cover_big')).toBe('https://images.igdb.com/igdb/image/upload/t_cover_big/qwe.jpg');
  });

  it('searchGameByTitle: returns url and slug when game is found', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';
    global.fetch = mockFetchSequence([
      async () => ({ ok: true, json: async () => ({ access_token: 't', expires_in: 300 }) }) as unknown as Response,
      async () => ({ ok: true, json: async () => [{ name: 'Halo', slug: 'halo', url: 'https://www.igdb.com/games/halo' }] }) as unknown as Response,
    ]) as unknown as typeof fetch;
    const { searchGameByTitle } = await import(IGDB_MODULE_PATH);
    const res = await searchGameByTitle('Halo');
    expect(res).toEqual({ url: 'https://www.igdb.com/games/halo', slug: 'halo' });
  });

  it('searchGameByTitle: returns null when IGDB returns empty list', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';
    global.fetch = mockFetchSequence([
      async () => ({ ok: true, json: async () => ({ access_token: 't', expires_in: 300 }) }) as unknown as Response,
      async () => ({ ok: true, json: async () => [] }) as unknown as Response,
    ]) as unknown as typeof fetch;
    const { searchGameByTitle } = await import(IGDB_MODULE_PATH);
    const res = await searchGameByTitle('NonExistent');
    expect(res).toBeNull();
  });

  it('searchGameByTitle: returns null when game has no url', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';
    global.fetch = mockFetchSequence([
      async () => ({ ok: true, json: async () => ({ access_token: 't', expires_in: 300 }) }) as unknown as Response,
      async () => ({ ok: true, json: async () => [{ name: 'Foo', slug: 'foo' }] }) as unknown as Response,
    ]) as unknown as typeof fetch;
    const { searchGameByTitle } = await import(IGDB_MODULE_PATH);
    const res = await searchGameByTitle('Foo');
    expect(res).toBeNull();
  });

  it('searchGameByTitle: escapes quotes and backslashes in the IGDB search query', async () => {
    process.env.TWITCH_CLIENT_ID = 'client-x';
    process.env.TWITCH_CLIENT_SECRET = 'secret-y';

    const calls: Array<{ url: string; init?: RequestInit }> = [];
    global.fetch = jest.fn(async (input: unknown, init?: unknown) => {
      calls.push({ url: String(input), init: init as RequestInit | undefined });
      if (String(input).includes('oauth2/token')) {
        return { ok: true, json: async () => ({ access_token: 'tok', expires_in: 300 }) } as unknown as Response;
      }
      return { ok: true, json: async () => [{ name: 'X', slug: 'x', url: 'https://www.igdb.com/games/x' }] } as unknown as Response;
    }) as unknown as typeof fetch;

    const { searchGameByTitle } = await import(IGDB_MODULE_PATH);
    await searchGameByTitle('My "IV" Game');

    const igdb = calls.find((c) => c.url.includes('https://api.igdb.com/v4/games'))!;
    const body = String(igdb.init?.body ?? '');
    expect(body).toContain('search "My');
    const escapedQuote = String.fromCharCode(92, 92, 34);
    expect(body).toContain(`${escapedQuote}IV${escapedQuote}`);
    expect(body).toContain('limit 1;');
  });

  it('searchCoverByTitle: returns null when IGDB returns empty list', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';
    global.fetch = mockFetchSequence([
      async () => ({ ok: true, json: async () => ({ access_token: 't', expires_in: 300 }) }) as unknown as Response,
      async () => ({ ok: true, json: async () => [] }) as unknown as Response,
    ]) as unknown as typeof fetch;
    const { searchCoverByTitle } = await import(IGDB_MODULE_PATH);
    const res = await searchCoverByTitle('Foo');
    expect(res).toBeNull();
  });

  it('getTopGamesOfYear: builds query with UTC bounds, requires cover, sorts by total_rating_count desc, caps limit', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const rows = [
      { name: 'G1', cover: { image_id: 'i1' } },
      { name: 'G2' }, // no cover → mapped imageUrl null
    ];
    global.fetch = jest.fn(async (input: unknown, init?: unknown) => {
      calls.push({ url: String(input), init: init as RequestInit | undefined });
      if (String(input).includes('oauth2/token')) return { ok: true, json: async () => ({ access_token: 't', expires_in: 300 }) } as unknown as Response;
      return { ok: true, json: async () => rows } as unknown as Response;
    }) as unknown as typeof fetch;

    const { getTopGamesOfYear } = await import(IGDB_MODULE_PATH);
    const data = await getTopGamesOfYear(2025, 50); // ask for more than max
    expect(data).toEqual([
      { title: 'G1', imageUrl: expect.stringContaining('/t_thumb/i1.jpg') },
      { title: 'G2', imageUrl: null },
    ]);

    const igdbCall = calls.find((c) => c.url.includes('api.igdb.com/v4/games'))!;
    const body = String(igdbCall.init?.body ?? '');
    // Bounds
    const start = Math.floor(new Date(Date.UTC(2025, 0, 1, 0, 0, 0)).getTime() / 1000);
    const end = Math.floor(new Date(Date.UTC(2026, 0, 1, 0, 0, 0)).getTime() / 1000);
    expect(body).toContain(`first_release_date >= ${start}`);
    expect(body).toContain(`first_release_date < ${end}`);
    // Require cover
    expect(body).toContain('cover != null');
    // Sort and cap limit to 20
    expect(body).toContain('sort total_rating_count desc;');
    expect(body).toContain('limit 20');
  });

  it('igdbRequest: retries exactly once on 401/403 by invalidating cached token', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';

    // Call order: token(t1) -> IGDB(401) -> token(t2) -> IGDB(200)
    const rows = [{ name: 'OK', cover: { image_id: 'i' } }];
    // Spy to observe Authorization header on the second IGDB call
    const auths: string[] = [];
    const mf = mockFetchSequence([
      async (input: RequestInfo) => {
        expect(String(input)).toContain('oauth2/token');
        return { ok: true, json: async () => ({ access_token: 't1', expires_in: 300 }) } as unknown as Response;
      },
      async (input: RequestInfo, init?: RequestInit) => {
        expect(String(input)).toContain('/v4/games');
        const h = (init as unknown as { headers?: Record<string, string> })?.headers ?? {};
        auths.push(h['Authorization']);
        return { ok: false, status: 401, text: async () => 'unauthorized' } as unknown as Response;
      },
      async (input: RequestInfo) => {
        expect(String(input)).toContain('oauth2/token');
        return { ok: true, json: async () => ({ access_token: 't2', expires_in: 300 }) } as unknown as Response;
      },
      async (input: RequestInfo, init?: RequestInit) => {
        expect(String(input)).toContain('/v4/games');
        const h = (init as unknown as { headers?: Record<string, string> })?.headers ?? {};
        auths.push(h['Authorization']);
        return { ok: true, json: async () => rows } as unknown as Response;
      },
    ]);
    global.fetch = mf as unknown as typeof fetch;

    const { getTopGamesOfYear } = await import(IGDB_MODULE_PATH);
    const res = await getTopGamesOfYear(2025, 8);
    expect(res).toEqual([{ title: 'OK', imageUrl: expect.stringContaining('/t_thumb/i.jpg') }]);
    // First call used t1, second call should use t2
    expect(auths[0]).toBe('Bearer t1');
    expect(auths[1]).toBe('Bearer t2');
  });

  it('igdbRequest: returns null and logs once when retry also fails', async () => {
    process.env.TWITCH_CLIENT_ID = 'abc';
    process.env.TWITCH_CLIENT_SECRET = 'shh';

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mf = mockFetchSequence([
      async () => ({ ok: true, json: async () => ({ access_token: 't1', expires_in: 300 }) }) as unknown as Response,
      async () => ({ ok: false, status: 401, text: async () => 'unauthorized' }) as unknown as Response,
      async () => ({ ok: true, json: async () => ({ access_token: 't2', expires_in: 300 }) }) as unknown as Response,
      async () => ({ ok: false, status: 500, text: async () => 'nope' }) as unknown as Response,
    ]);
    global.fetch = mf as unknown as typeof fetch;

    const { searchCoverByTitle } = await import(IGDB_MODULE_PATH);
    const res = await searchCoverByTitle('Halo');
    expect(res).toBeNull();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });
});
