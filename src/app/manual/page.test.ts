/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
// Use an in-scope variable name starting with "mock" to satisfy Jest's mock factory scoping rules
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockReact = require('react');
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';

// Stubs for Next.js and UI components used by the page
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('next/link', () => ({ __esModule: true, default: (props: any) => mockReact.createElement('a', { href: props.href }, props.children) }));
jest.mock('next/image', () => ({ __esModule: true, default: (props: any) => mockReact.createElement('img', { ...props }) }));

// Minimal UI shims
// Use a mock-prefixed helper so Jest allows referencing it inside factory functions
const mockPassthrough = (tag: string) => (props: any) => mockReact.createElement(tag, { ...props }, props.children);
jest.mock('@/components/ui/button', () => ({ Button: mockPassthrough('button') }));
jest.mock('@/components/ui/input', () => ({ Input: mockPassthrough('input') }));
jest.mock('@/components/ui/card', () => ({ Card: mockPassthrough('div'), CardContent: mockPassthrough('div'), CardHeader: mockPassthrough('div'), CardTitle: mockPassthrough('div') }));
jest.mock('@/components/ui/dialog', () => ({ Dialog: mockPassthrough('div'), DialogContent: mockPassthrough('div'), DialogHeader: mockPassthrough('div'), DialogTitle: mockPassthrough('div'), DialogFooter: mockPassthrough('div'), DialogClose: mockPassthrough('button') }));
jest.mock('@/components/ui/toggle-group', () => ({ ToggleGroup: mockPassthrough('div'), ToggleGroupItem: mockPassthrough('button') }));
jest.mock('@/components/ui/label', () => ({ Label: mockPassthrough('label') }));
jest.mock('@/components/ui/slider', () => ({ Slider: (props: any) => mockReact.createElement('input', { type: 'range', ...props }) }));
jest.mock('@/components/logo', () => ({ Logo: mockPassthrough('div') }));
jest.mock('@/components/ui/badge', () => ({ Badge: mockPassthrough('span') }));
jest.mock('@/components/ui/alert', () => ({ Alert: mockPassthrough('div'), AlertDescription: mockPassthrough('div'), AlertTitle: mockPassthrough('div') }));
jest.mock('lucide-react', () => ({ AlertTriangle: mockPassthrough('span'), ArrowLeft: mockPassthrough('span'), Dices: mockPassthrough('span'), Download: mockPassthrough('span'), Gamepad: mockPassthrough('span'), Gamepad2: mockPassthrough('span'), Joystick: mockPassthrough('span'), Loader2: mockPassthrough('span'), PcCase: mockPassthrough('span'), Plus: mockPassthrough('span'), Trash2: mockPassthrough('span') }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

const originalFetch = global.fetch;
const originalSession = global.sessionStorage;

function setupDom() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  return { container, root } as { container: HTMLElement; root: Root };
}

function teardownDom(root: Root, container: HTMLElement) {
  root.unmount();
  container.remove();
}

describe('Manual page: banner and quick-picks', () => {
  beforeEach(() => {
    jest.resetModules();
    // Fresh sessionStorage mock per test
    const store = new Map<string, string>();
    // @ts-ignore
    global.sessionStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => void store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    } as any;
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
    // @ts-ignore
    global.sessionStorage = originalSession;
  });

  it('renders the unsaved list banner with the exact copy', async () => {
    // Mock fetch for games.json and quick-picks
    global.fetch = jest.fn(async (input: any) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as any;
      if (String(input).includes('/api/igdb/top-this-year')) return { ok: true, json: async () => ({ suggestions: [] }) } as any;
      throw new Error('unexpected fetch ' + input);
    }) as any;

    const { container, root } = setupDom();
    const Page = (await import('./page')).default;
    await act(async () => { root.render(React.createElement(Page)); });

    // Title
    expect(container.textContent).toContain('Heads up');
    // Exact body copy
    expect(container.textContent).toContain("This list isn't saved. If you exit this page, your added games will be lost.");

    teardownDom(root, container);
  });

  it('fetches quick-picks once on first mount (no cache), normalizes to 8 items, and applies image URL allowlist', async () => {
    const year = new Date().getUTCFullYear();
    const suggestions = [
      // 9 items (one over); include an unsafe image URL to be dropped to placeholder
      ...Array.from({ length: 7 }, (_, i) => ({ title: `Safe ${i + 1}`, imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/img.jpg' })),
      { title: 'Unsafe', imageUrl: 'http://evil.com/foo.jpg' },
      { title: 'Another', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/ok.jpg' },
    ];

    const fetchMock = jest.fn(async (input: any) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as any;
      if (String(input).includes('/api/igdb/top-this-year')) return { ok: true, json: async () => ({ suggestions }) } as any;
      throw new Error('unexpected fetch ' + input);
    });
    // @ts-ignore
    global.fetch = fetchMock;

    const { container, root } = setupDom();
    const Page = (await import('./page')).default;
    await act(async () => { root.render(React.createElement(Page)); });

    // Quick-picks header present
    expect(container.textContent).toContain('Top games this year');
    // Exactly 8 quick-pick buttons
    const buttons = container.querySelectorAll('button[aria-label^="Quick add "]');
    expect(buttons.length).toBe(8);

    // Unsafe one should render placeholder image
    const unsafe = Array.from(buttons).find((b) => (b as HTMLElement).getAttribute('aria-label') === 'Quick add Unsafe')!;
    const img = unsafe.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://placehold.co/40x40.png');

    // Fetch to API should have been called exactly once
    expect(fetchMock.mock.calls.filter((c: any[]) => String(c[0]).includes('/api/igdb/top-this-year')).length).toBe(1);

    // Should have cached the normalized list for the current UTC year
    const cacheKey = `gw:top-this-year:${year}`;
    expect(sessionStorage.getItem(cacheKey)).toBeTruthy();

    teardownDom(root, container);
  });

  it('uses sessionStorage cache on subsequent mounts and does not re-fetch from API', async () => {
    const year = new Date().getUTCFullYear();
    const cacheKey = `gw:top-this-year:${year}`;
    sessionStorage.setItem(cacheKey, JSON.stringify([
      { title: 'Cached 1', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 2', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 3', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 4', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 5', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 6', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 7', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
      { title: 'Cached 8', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/i.jpg' },
    ]));

    const fetchMock = jest.fn(async (input: any) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as any;
      if (String(input).includes('/api/igdb/top-this-year')) return { ok: true, json: async () => ({ suggestions: [] }) } as any;
      throw new Error('unexpected fetch ' + input);
    });
    // @ts-ignore
    global.fetch = fetchMock;

    const { container, root } = setupDom();
    const Page = (await import('./page')).default;
    await act(async () => { root.render(React.createElement(Page)); });

    // 8 cached buttons should be rendered
    const buttons = container.querySelectorAll('button[aria-label^="Quick add "]');
    expect(buttons.length).toBe(8);
    // API not called because cache was present
    expect(fetchMock.mock.calls.filter((c: any[]) => String(c[0]).includes('/api/igdb/top-this-year')).length).toBe(0);

    teardownDom(root, container);
  });

  it('gracefully hides quick-picks when API responds non-OK or throws', async () => {
    // Non-OK
    let mode: 'nonok' | 'throw' = 'nonok';
    const fetchMock = jest.fn(async (input: any) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as any;
      if (String(input).includes('/api/igdb/top-this-year')) {
        if (mode === 'nonok') return { ok: false, status: 500 } as any;
        throw new Error('boom');
      }
      throw new Error('unexpected fetch ' + input);
    });
    // @ts-ignore
    global.fetch = fetchMock;

    const { container, root } = setupDom();
    const Page = (await import('./page')).default;
    await act(async () => { root.render(React.createElement(Page)); });
    // Header should not appear; fallback message visible
    expect(container.textContent).not.toContain('Top games this year');
    expect(container.textContent).toContain('Top picks unavailable right now.');

    // Now throwing mode
    await act(async () => {
      root.unmount();
    });
    const container2 = document.createElement('div');
    document.body.appendChild(container2);
    const root2 = createRoot(container2);
    mode = 'throw';
    await act(async () => { root2.render(React.createElement(Page)); });
    expect(container2.textContent).not.toContain('Top games this year');
    expect(container2.textContent).toContain('Top picks unavailable right now.');

    teardownDom(root2, container2);
  });
});
