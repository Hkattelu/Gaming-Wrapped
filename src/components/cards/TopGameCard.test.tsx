import { render, screen, waitFor } from '@testing-library/react';
import { TopGameCard } from './TopGameCard';
import { TopGameCard as TopGameCardType } from '@/types';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ imageUrl: 'http://example.com/image.jpg' }),
  })
) as jest.Mock;

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('TopGameCard', () => {
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
        expect(screen.getByText('95/100')).toBeInTheDocument();
    });
    // Ensure the fallback /10 is NOT present (it might be present in other DOM elements if not careful, but here we check it's not part of the score display logic we touched)
    // Actually /10 is in a span, so we can check it's not there.
    expect(screen.queryByText('/10')).not.toBeInTheDocument();
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
        expect(screen.getByText('9')).toBeInTheDocument();
        expect(screen.getByText('/10')).toBeInTheDocument();
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
        expect(screen.getByText('9.5')).toBeInTheDocument();
        expect(screen.getByText('/10')).toBeInTheDocument();
    });
  });
});
