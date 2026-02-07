'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface SideAdBannerProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const SideAdBanner: React.FC<SideAdBannerProps> = ({ 
  orientation = 'vertical',
  className 
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('Adsbygoogle push error:', err);
    }
  }, []);

  return (
    <div 
      className={cn(
        "relative overflow-hidden flex items-center justify-center border-2 border-zinc-700 bg-zinc-900/50 pixel-corners group min-h-[100px]",
        orientation === 'vertical' ? "w-full h-full" : "w-full h-24",
        className
      )}
      data-testid="side-ad-banner"
    >
      {/* Retro Effects */}
      <div className="absolute inset-0 crt-overlay pointer-events-none z-10 opacity-30 group-hover:opacity-50 transition-opacity" />
      <div className="scanline z-10 opacity-20" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-retro-grid-40 z-0" />
      
      {/* Ad Content */}
      <div className={cn(
        "relative z-20 w-full h-full flex items-center justify-center overflow-hidden",
        orientation === 'vertical' ? "p-2" : "p-1"
      )}>
        <ins 
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client="ca-pub-5108380761431058"
          data-ad-slot="4187351816"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* Decorative Side Bars */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
    </div>
  );
};