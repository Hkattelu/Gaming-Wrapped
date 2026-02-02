/** @jest-environment jsdom */
import { describe, it, expect, cleanup } from '@jest/globals';
import React from 'react';
import { render, screen, cleanup as rtlCleanup } from '@testing-library/react';
import { SideAdBanner } from './side-ad-banner';

describe('SideAdBanner', () => {
  afterEach(() => {
    rtlCleanup();
  });

  it('renders a placeholder with "Coming Soon" text', () => {
    render(<SideAdBanner />);
    expect(screen.getByText(/Coming Soon/i)).toBeTruthy();
  });

  it('has a specific data-testid for the ad container', () => {
    render(<SideAdBanner />);
    expect(screen.getByTestId('side-ad-banner')).toBeTruthy();
  });

  it('contains CRT overlay and scanline elements', () => {
    render(<SideAdBanner />);
    const adContainer = screen.getByTestId('side-ad-banner');
    expect(adContainer.querySelector('.crt-overlay')).toBeTruthy();
    expect(adContainer.querySelector('.scanline')).toBeTruthy();
  });

  it('uses pixel-corners class', () => {
    render(<SideAdBanner />);
    const adContainer = screen.getByTestId('side-ad-banner');
    expect(adContainer.classList.contains('pixel-corners')).toBe(true);
  });
});
