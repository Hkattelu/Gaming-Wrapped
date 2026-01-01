/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { act } from 'react';

const mockReact = React;

jest.mock('lucide-react', () => ({
  Rocket: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'rocket-icon', ...props }),
  Shield: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'shield-icon', ...props }),
  Gamepad2: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'gamepad-icon', ...props }),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'sparkles-icon', ...props }),
  Compass: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'compass-icon', ...props }),
  Map: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'map-icon', ...props }),
  ExternalLink: (props: React.SVGProps<SVGSVGElement>) => mockReact.createElement('span', { 'data-testid': 'external-link-icon', ...props }),
}));

import type { RecommendationsCard } from '@/types';
import { RecommendationsCardComponent } from './RecommendationsCard';

type MockFetch = jest.MockedFunction<typeof fetch>;

const createMockFetch = (): MockFetch => jest.fn() as MockFetch;

describe('RecommendationsCardComponent', () => {
  let mockFetch: MockFetch;
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockFetch = createMockFetch();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  const mockFetchResponse = (url: string | null) => {
    mockFetch.mockResolvedValue({
      json: async () => ({ url }),
    } as Response);
  };

  it('renders the card title', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Games You Should Play',
      recommendations: [
        { game: 'Disco Elysium', blurb: 'For the deep narrative itch' },
      ],
    };

    mockFetchResponse(null);

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    expect(screen.getByText('DISCO ELYSIUM')).toBeTruthy();
  });

  it('renders all recommendations with game names and blurbs', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Recommended Games',
      recommendations: [
        { game: 'Hollow Knight', blurb: 'A challenging metroidvania' },
        { game: 'The Witcher 3', blurb: 'Epic open-world RPG' },
      ],
    };

    mockFetchResponse(null);

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    expect(screen.getByText('HOLLOW KNIGHT')).toBeTruthy();
    expect(screen.getByText(/A challenging metroidvania/)).toBeTruthy();
    expect(screen.getByText('THE WITCHER 3')).toBeTruthy();
    expect(screen.getByText(/Epic open-world RPG/)).toBeTruthy();
  });

  it('renders links when IGDB URLs are returned', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Recommended Games',
      recommendations: [
        { game: 'Disco Elysium', blurb: 'Deep RPG narrative' },
      ],
    };

    mockFetchResponse('https://www.igdb.com/games/disco-elysium');

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toBe('https://www.igdb.com/games/disco-elysium');
      expect(link.getAttribute('target')).toBe('_blank');
    });
  });

  it('renders text without link when IGDB URL fetch fails', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Recommended Games',
      recommendations: [
        { game: 'Unknown Game', blurb: 'You might like it' },
      ],
    };

    mockFetch.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    expect(screen.getByText('UNKNOWN GAME')).toBeTruthy();
    expect(screen.getByText(/You might like it/)).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('uses pre-existing igdbUrl if provided', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Recommended Games',
      recommendations: [
        { game: 'Test Game', blurb: 'Test blurb', igdbUrl: 'https://www.igdb.com/games/test-game' },
      ],
    };

    mockFetchResponse(null);

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    await waitFor(() => {
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('https://www.igdb.com/games/test-game');
    });
  });

  it('calls the IGDB API for each recommendation without pre-existing URL', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Games',
      recommendations: [
        { game: 'Game One', blurb: 'Blurb one' },
        { game: 'Game Two', blurb: 'Blurb two' },
      ],
    };

    mockFetchResponse(null);

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    const calls = mockFetch.mock.calls;
    const bodies = calls.map((c) => c[1]?.body);
    expect(bodies).toContain(JSON.stringify({ title: 'Game One' }));
    expect(bodies).toContain(JSON.stringify({ title: 'Game Two' }));
  });
});
