/** @jest-environment jsdom */
import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, cleanup as rtlCleanup } from '@testing-library/react';
import { WrappedSlideshow } from './wrapped-slideshow';
import { WrappedData } from '@/types';

// Mock resize observer
global.ResizeObserver = class ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockReact = React;

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Gift: () => <div data-testid="gift-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Gamepad2: () => <div data-testid="gamepad-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the components that might cause issues in a simple test
jest.mock('./retro-frame', () => ({
  RetroFrame: ({ children }: { children: React.ReactNode }) => <div data-testid="retro-frame">{children}</div>
}));

jest.mock('./side-ad-banner', () => ({
  SideAdBanner: () => <div data-testid="side-ad-banner">Ad Banner</div>
}));

jest.mock('./tilt-card', () => ({
  TiltCard: ({ children }: { children: React.ReactNode }) => <div data-testid="tilt-card">{children}</div>
}));

// Mock Card Components
jest.mock('./cards/PlatformStatsCard', () => ({ PlatformStatsCard: () => <div /> }));
jest.mock('./cards/TopGameCard', () => ({ TopGameCard: () => <div /> }));
jest.mock('./cards/SummaryCard', () => ({ SummaryCard: () => <div /> }));
jest.mock('./cards/GenreBreakdownCard', () => ({ GenreBreakdownCard: () => <div /> }));
jest.mock('./cards/ScoreDistributionCard', () => ({ ScoreDistributionCard: () => <div /> }));
jest.mock('./cards/PlayerPersonaCard', () => ({ __esModule: true, default: () => <div /> }));
jest.mock('./cards/RoastCard', () => ({ RoastCardComponent: () => <div /> }));
jest.mock('./cards/RecommendationsCard', () => ({ RecommendationsCardComponent: () => <div /> }));

jest.mock('./ui/carousel', () => ({
  Carousel: ({ children, setApi }: any) => {
    mockReact.useEffect(() => {
        if (setApi) {
            setApi({
                canScrollNext: () => true,
                scrollNext: () => {},
                scrollPrev: () => {},
                on: () => {},
                scrollSnapList: () => [0],
                selectedScrollSnap: () => 0
            });
        }
    }, [setApi]);
    return <div data-testid="carousel">{children}</div>;
  },
  CarouselContent: ({ children }: any) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children }: any) => <div data-testid="carousel-item">{children}</div>,
}));

jest.mock('./ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>{children}</button>
  ),
}));

const mockData: WrappedData = {
  cards: [
    { type: 'player_persona', persona: 'Gamer', title: 'Persona', description: 'Desc' }
  ] as any,
  averageScore: 8
};

describe('WrappedSlideshow Integration', () => {
  afterEach(() => {
    rtlCleanup();
  });

  it('renders ad banners on desktop-like layouts', () => {
    render(<WrappedSlideshow data={mockData} id="test-id" />);
    const adBanners = screen.getAllByTestId('side-ad-banner');
    // 2 side banners + 1 top banner
    expect(adBanners.length).toBe(3);
  });

  it('has responsive classes for banners and spacing', () => {
    render(<WrappedSlideshow data={mockData} id="test-id" />);
    const adBanners = screen.getAllByTestId('side-ad-banner');
    
    // Top banner (first in DOM)
    expect(adBanners[0].parentElement?.className).toContain('xl:hidden');
    
    // Side banner
    expect(adBanners[1].parentElement?.className).toContain('hidden xl:block');

    // Check spacing container
    const mainLayout = screen.getByTestId('retro-frame').parentElement;
    expect(mainLayout?.className).toContain('xl:gap-24');
  });
});