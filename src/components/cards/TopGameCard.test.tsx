/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

const mockReact = React;

jest.mock('lucide-react', () => ({
  Gamepad2: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'gamepad2-icon', ...props }),
  Monitor: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'monitor-icon', ...props }),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'arrow-left-icon', ...props }),
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'arrow-right-icon', ...props }),
}));

import { TopGameCard } from './TopGameCard';
import type { TopGameCard as TopGameCardType } from '@/types';

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TopGameCard', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ imageUrl: 'http://example.com/image.jpg' }),
      })
    ) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
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

    // Check for the formatted score text
    await waitFor(() => {
        expect(screen.getByText('95/100')).toBeTruthy();
    });
    // Ensure the fallback /10 is NOT present (it might be present in other DOM elements if not careful, but here we check it's not part of the score display logic we touched)
    // Actually /10 is in a span, so we can check it's not there.
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
        // 95 > 10 -> 95/10 = 9.5
        expect(screen.getByText('9.5')).toBeTruthy();
        expect(screen.getByText('/10')).toBeTruthy();
    });
  });
});
