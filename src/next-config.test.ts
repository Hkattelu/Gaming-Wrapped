import { describe, it, expect } from '@jest/globals';

describe('next.config.ts images remotePatterns', () => {
  it('allows images.igdb.com/igdb/image/upload/**', async () => {
    // next.config.ts is at the repo root; require default export
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cfg = require('../next.config').default as any;
    const patterns = cfg?.images?.remotePatterns ?? [];
    const match = patterns.find((p: any) => p.hostname === 'images.igdb.com');
    expect(match).toBeDefined();
    expect(match.protocol).toBe('https');
    expect(match.pathname).toBe('/igdb/image/upload/**');
  });
});
