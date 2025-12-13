/** @jest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { act } from 'react';

const mockReact = React;

jest.mock('@/components/ui/card', () => ({
  Card: (props: any) => mockReact.createElement('div', { ...props }, props.children),
  CardContent: (props: any) => mockReact.createElement('div', { ...props }, props.children),
  CardHeader: (props: any) => mockReact.createElement('div', { ...props }, props.children),
  CardTitle: (props: any) => mockReact.createElement('h2', { ...props }, props.children),
}));

jest.mock('lucide-react', () => ({
  Lightbulb: (props: any) => mockReact.createElement('span', { 'data-testid': 'lightbulb-icon', ...props }),
  ExternalLink: (props: any) => mockReact.createElement('span', { 'data-testid': 'external-link-icon', ...props }),
}));

import type { RecommendationsCard } from '@/types';
import { RecommendationsCardComponent } from './RecommendationsCard';

const originalFetch = global.fetch;

describe('RecommendationsCardComponent', () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    cleanup();
  });

  it('renders the card title', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Games You Should Play',
      recommendations: [
        { game: 'Disco Elysium', blurb: 'For the deep narrative itch' },
      ],
    };

    // @ts-ignore
    global.fetch.mockResolvedValue({
      json: async () => ({ url: null }),
    });

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    expect(screen.getByText('Games You Should Play')).toBeTruthy();
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

    // @ts-ignore
    global.fetch.mockResolvedValue({
      json: async () => ({ url: null }),
    });

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    expect(screen.getByText('Hollow Knight')).toBeTruthy();
    expect(screen.getByText('A challenging metroidvania')).toBeTruthy();
    expect(screen.getByText('The Witcher 3')).toBeTruthy();
    expect(screen.getByText('Epic open-world RPG')).toBeTruthy();
  });

  it('renders links when IGDB URLs are returned', async () => {
    const card: RecommendationsCard = {
      type: 'recommendations',
      title: 'Recommended Games',
      recommendations: [
        { game: 'Disco Elysium', blurb: 'Deep RPG narrative' },
      ],
    };

    // @ts-ignore
    global.fetch.mockResolvedValue({
      json: async () => ({ url: 'https://www.igdb.com/games/disco-elysium' }),
    });

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

    // @ts-ignore
    global.fetch.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    expect(screen.getByText('Unknown Game')).toBeTruthy();
    expect(screen.getByText('You might like it')).toBeTruthy();
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

    // @ts-ignore
    global.fetch.mockResolvedValue({
      json: async () => ({ url: null }),
    });

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

    // @ts-ignore
    global.fetch.mockResolvedValue({
      json: async () => ({ url: null }),
    });

    await act(async () => {
      render(mockReact.createElement(RecommendationsCardComponent, { card }));
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // @ts-ignore
    const calls = global.fetch.mock.calls as any[];
    const bodies = calls.map((c: any[]) => c[1]?.body);
    expect(bodies).toContain(JSON.stringify({ title: 'Game One' }));
    expect(bodies).toContain(JSON.stringify({ title: 'Game Two' }));
  });
});
