import React from 'react';
import { cn } from '@/lib/utils';

interface SideAdBannerProps {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const SideAdBanner: React.FC<SideAdBannerProps> = ({ 
  orientation = 'vertical',
  className 
}) => {
  return (
    <div 
      className={cn(
        "relative overflow-hidden flex items-center justify-center border-2 border-zinc-700 bg-zinc-900/50 p-4 pixel-corners",
        orientation === 'vertical' ? "w-full h-full" : "w-full h-24",
        className
      )}
      data-testid="side-ad-banner"
    >
      {/* Retro Effects */}
      <div className="absolute inset-0 crt-overlay pointer-events-none z-10" />
      <div className="scanline z-10" />
      
      {/* Ad Content */}
      <div className={cn(
        "text-center relative z-0 flex items-center justify-center",
        orientation === 'vertical' ? "flex-col" : "flex-row gap-6"
      )}>
        <div className={cn("opacity-50", orientation === 'vertical' ? "mb-2" : "mr-4")}>
          <div className="w-10 h-10 border-2 border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-700 font-mono text-lg">?</span>
          </div>
        </div>
        <div>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest animate-pulse-slow">
            Coming Soon
          </p>
          <p className="text-zinc-700 font-mono text-[10px] uppercase">
            Ad Space Available
          </p>
        </div>
      </div>
    </div>
  );
};
