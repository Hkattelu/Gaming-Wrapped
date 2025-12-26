/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

const mockReact = React;

jest.mock('lucide-react', () => ({
  Gamepad2: ({ className }: React.SVGProps<SVGSVGElement>) =>
    mockReact.createElement('span', { 'data-testid': 'gamepad2-icon', className }),
  Monitor: ({ className }: React.SVGProps<SVGSVGElement>) =>
    mockReact.createElement('span', { 'data-testid': 'monitor-icon', className }),
  ArrowLeft: ({ className }: React.SVGProps<SVGSVGElement>) =>
    mockReact.createElement('span', { 'data-testid': 'arrow-left-icon', className }),
  ArrowRight: ({ className }: React.SVGProps<SVGSVGElement>) =>
    mockReact.createElement('span', { 'data-testid': 'arrow-right-icon', className }),
}));

import { TopGameCard } from './TopGameCard';
import type { TopGameCard as TopGameCardType } from '@/types';

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TopGameCard', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(async () =>
      ({
        json: async () => ({ imageUrl: 'http://example.com/image.jpg' }),
      }) as unknown as Response
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    if (typeof originalFetch === 'undefined') {
      // @ts-expect-error - allow removing the global property if it was missing originally
      delete global.fetch;
    } else {
      global.fetch = originalFetch;
    }
    cleanup();
  });

  it('renders formattedScore when present', async () => {
    const card: TopGameCardType = {
      type: 'top_game',
      title: 'Top Game',
      description: 'The best game.',
      game: {
        title: 'My Game',
        platform: 'PC',
        score: 95,
        formattedScore: '95/100',
        notes: 'Great game',
      },
    };

    render(<TopGameCard card={card} />);

    await waitFor(() => {
      expect(screen.getByText('95/100')).toBeTruthy();
    });
    expect(screen.queryByText('/10')).toBeNull();
  });

  it('renders standard score with /10 fallback when formattedScore is missing', async () => {
    const card: TopGameCardType = {
      type: 'top_game',
      title: 'Top Game',
      description: 'The best game.',
      game: {
        title: 'My Game',
        platform: 'PC',
        score: 9,
        notes: 'Great game',
      },
    };

    render(<TopGameCard card={card} />);

    await waitFor(() => {
      expect(screen.getByText('9')).toBeTruthy();
      expect(screen.getByText('/10')).toBeTruthy();
    });
  });

  it('renders standard score divided by 10 if > 10 when formattedScore is missing', async () => {
    const card: TopGameCardType = {
      type: 'top_game',
      title: 'Top Game',
      description: 'The best game.',
      game: {
        title: 'My Game',
        platform: 'PC',
        score: 95,
        notes: 'Great game',
      },
    };

    render(<TopGameCard card={card} />);

    await waitFor(() => {
      expect(screen.getByText('9.5')).toBeTruthy();
      expect(screen.getByText('/10')).toBeTruthy();
    });
  });
});
