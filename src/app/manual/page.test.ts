/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, cleanup, within } from '@testing-library/react';

interface MockPassthroughProps {
  href?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

// Helper function to create passthrough components (must be called from within mock factories)
// Note: Mock factories run in a separate scope and can't reference outer variables,
// so we pass React as an argument in each mock factory
function mockCreatePassthrough(React: typeof import('react'), tag: string) {
  return (props: MockPassthroughProps) => React.createElement(tag, { ...props }, props.children);
}

// Stubs for Next.js and UI components used by the page
// Note: jest.mock() requires dynamic require() to access fresh React instances
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('next/link', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    __esModule: true, 
    default: (props: MockPassthroughProps) => React.createElement('a', { href: props.href }, props.children) 
  };
});
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    __esModule: true, 
    default: (props: MockPassthroughProps) => React.createElement('img', { ...props }) 
  };
});

// Minimal UI shims
jest.mock('@/components/ui/button', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { Button: mockCreatePassthrough(React, 'button') };
});
jest.mock('@/components/ui/input', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { Input: mockCreatePassthrough(React, 'input') };
});
jest.mock('@/components/ui/card', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    Card: mockCreatePassthrough(React, 'div'), 
    CardContent: mockCreatePassthrough(React, 'div'), 
    CardHeader: mockCreatePassthrough(React, 'div'), 
    CardTitle: mockCreatePassthrough(React, 'div') 
  };
});
jest.mock('@/components/ui/dialog', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    Dialog: mockCreatePassthrough(React, 'div'), 
    DialogContent: mockCreatePassthrough(React, 'div'), 
    DialogHeader: mockCreatePassthrough(React, 'div'), 
    DialogTitle: mockCreatePassthrough(React, 'div'), 
    DialogFooter: mockCreatePassthrough(React, 'div'), 
    DialogClose: mockCreatePassthrough(React, 'button') 
  };
});
jest.mock('@/components/ui/toggle-group', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    ToggleGroup: mockCreatePassthrough(React, 'div'), 
    ToggleGroupItem: mockCreatePassthrough(React, 'button') 
  };
});
jest.mock('@/components/ui/label', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { Label: mockCreatePassthrough(React, 'label') };
});
jest.mock('@/components/ui/slider', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    Slider: (props: MockPassthroughProps) => React.createElement('input', { type: 'range', ...props }) 
  };
});
jest.mock('@/components/logo', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { Logo: mockCreatePassthrough(React, 'div') };
});
jest.mock('@/components/ui/badge', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { Badge: mockCreatePassthrough(React, 'span') };
});
jest.mock('@/components/ui/alert', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return { 
    Alert: mockCreatePassthrough(React, 'div'), 
    AlertDescription: mockCreatePassthrough(React, 'div'), 
    AlertTitle: mockCreatePassthrough(React, 'div') 
  };
});
jest.mock('lucide-react', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  const mockComponent = mockCreatePassthrough(React, 'span');
  return { 
    AlertTriangle: mockComponent, 
    ArrowLeft: mockComponent, 
    Dices: mockComponent, 
    Download: mockComponent, 
    Gamepad: mockComponent, 
    Gamepad2: mockComponent, 
    Joystick: mockComponent, 
    Loader2: mockComponent, 
    PcCase: mockComponent, 
    Plus: mockComponent, 
    Trash2: mockComponent 
  };
});
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

const originalFetch = global.fetch;
const originalSession = global.sessionStorage;

describe('Manual page: banner and quick-picks', () => {
  beforeEach(() => {
    // Clear the previous sessionStorage first to ensure clean state between tests
    if (global.sessionStorage && global.sessionStorage.clear) {
      global.sessionStorage.clear();
    }
    
    // Clear the page module cache to get fresh component state for each test.
    // This ensures that useEffect closures capture the new sessionStorage instance.
    delete require.cache[require.resolve('./page')];
    
    // Fresh sessionStorage mock per test with isolated storage Map
    const store = new Map<string, string>();
    // @ts-expect-error - Mock sessionStorage for testing
    global.sessionStorage = {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
      clear: () => void store.clear(),
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    } as unknown as Storage;
  });

  afterEach(() => {
    global.fetch = originalFetch as unknown as typeof fetch;
    // @ts-expect-error - Restore original sessionStorage
    global.sessionStorage = originalSession;
  });

  it('renders the unsaved list banner with the exact copy', async () => {
    // Mock fetch for games.json and quick-picks
    global.fetch = jest.fn(async (input: unknown) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as unknown as Response;
      if (String(input).includes('/api/igdb/top-this-year')) return { ok: true, json: async () => ({ suggestions: [] }) } as unknown as Response;
      throw new Error('unexpected fetch ' + input);
    }) as unknown as typeof fetch;

    const Page = (await import('./page')).default as React.ComponentType;
    render(React.createElement(Page));

    // Title and body copy
    expect(screen.getByText('Heads up')).toBeTruthy();
    expect(screen.getByText("This list isn't saved. If you exit this page, your added games will be lost.")).toBeTruthy();

    cleanup();
  });

  it('fetches quick-picks once on first mount (no cache), normalizes to 8 items, and applies image URL allowlist', async () => {
    const year = new Date().getUTCFullYear();
    const suggestions = [
      // 9 items (one over); include an unsafe image URL to be dropped to placeholder
      ...Array.from({ length: 7 }, (_, i) => ({ title: `Safe ${i + 1}`, imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/img.jpg' })),
      { title: 'Unsafe', imageUrl: 'http://evil.com/foo.jpg' },
      { title: 'Another', imageUrl: 'https://images.igdb.com/igdb/image/upload/t_thumb/ok.jpg' },
    ];

    const fetchMock = jest.fn(async (input: unknown) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as unknown as Response;
      if (String(input).includes('/api/igdb/top-this-year')) return { ok: true, json: async () => ({ suggestions }) } as unknown as Response;
      throw new Error('unexpected fetch ' + input);
    });
    // @ts-expect-error - Mock fetch for testing
    global.fetch = fetchMock;

    const Page = (await import('./page')).default as React.ComponentType;
    render(React.createElement(Page));

    // Quick-picks header present
    expect(await screen.findByText('Top games this year')).toBeTruthy();
    // Exactly 8 quick-pick buttons
    const buttons = await screen.findAllByRole('button', { name: /Quick add / });
    expect(buttons.length).toBe(8);

    // Unsafe one should render placeholder image
    const unsafe = buttons.find((b) => b.getAttribute('aria-label') === 'Quick add Unsafe')!;
    const img = within(unsafe).getByRole('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://placehold.co/40x40.png');

    // Fetch to API should have been called exactly once
    expect(fetchMock.mock.calls.filter((c: unknown[]) => String((c as unknown[])[0]).includes('/api/igdb/top-this-year')).length).toBe(1);

    // Should have cached the normalized list for the current UTC year
    const cacheKey = `gw:top-this-year:${year}`;
    expect(sessionStorage.getItem(cacheKey)).toBeTruthy();

    cleanup();
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

    const fetchMock = jest.fn(async (input: unknown) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as unknown as Response;
      if (String(input).includes('/api/igdb/top-this-year')) return { ok: true, json: async () => ({ suggestions: [] }) } as unknown as Response;
      throw new Error('unexpected fetch ' + input);
    });
    // @ts-expect-error - Mock fetch for testing
    global.fetch = fetchMock;

    const Page = (await import('./page')).default as React.ComponentType;
    render(React.createElement(Page));

    // 8 cached buttons should be rendered
    const buttons = await screen.findAllByRole('button', { name: /Quick add / });
    expect(buttons.length).toBe(8);
    // API not called because cache was present
    expect(fetchMock.mock.calls.filter((c: unknown[]) => String((c as unknown[])[0]).includes('/api/igdb/top-this-year')).length).toBe(0);

    cleanup();
  });

  it('gracefully hides quick-picks when API responds non-OK or throws', async () => {
    // Non-OK
    let mode: 'nonok' | 'throw' = 'nonok';
    const fetchMock = jest.fn(async (input: unknown) => {
      if (String(input).includes('/games.json')) return { ok: true, json: async () => [] } as unknown as Response;
      if (String(input).includes('/api/igdb/top-this-year')) {
        if (mode === 'nonok') return { ok: false, status: 500 } as unknown as Response;
        throw new Error('boom');
      }
      throw new Error('unexpected fetch ' + input);
    });
    // @ts-expect-error - Mock fetch for testing
    global.fetch = fetchMock;

    const Page = (await import('./page')).default as React.ComponentType;
    render(React.createElement(Page));
    
    // Wait for async fetch to complete and error message to appear
    expect(await screen.findByText('Top picks unavailable right now.')).toBeTruthy();
    // Header should not appear
    expect(screen.queryByText('Top games this year')).toBeNull();

    // Now throwing mode
    cleanup();
    mode = 'throw';
    render(React.createElement(Page));
    // Wait for async fetch to complete
    expect(await screen.findByText('Top picks unavailable right now.')).toBeTruthy();
    expect(screen.queryByText('Top games this year')).toBeNull();

    cleanup();
  });
});
