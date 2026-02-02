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
        "relative overflow-hidden flex items-center justify-center border-2 border-zinc-700 bg-zinc-900/50 p-4 pixel-corners group",
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
        "text-center relative z-20 flex items-center justify-center",
        orientation === 'vertical' ? "flex-col" : "flex-row gap-8"
      )}>
        <div className={cn(
          "relative",
          orientation === 'vertical' ? "mb-6" : ""
        )}>
          {/* Stylized Icon Box */}
          <div className="w-12 h-12 border-2 border-zinc-700 flex items-center justify-center relative bg-zinc-950/50">
            <div className="absolute inset-0 bg-primary/5 animate-pulse-slow" />
            <span className="text-primary font-mono text-xl font-bold animate-flicker">?</span>
            
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-primary/40" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative">
            <p className="text-zinc-400 font-mono text-sm uppercase tracking-[0.2em] animate-pulse-slow">
              Coming Soon
            </p>
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-700 to-transparent mt-1" />
          </div>
          <p className="text-zinc-600 font-mono text-[9px] uppercase tracking-widest">
            Broadcast Channel [OFFLINE]
          </p>
          <div className="flex gap-1 justify-center mt-2 opacity-30">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-zinc-500 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Side Bars */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
    </div>
  );
};