import React from 'react';

export const SideAdBanner: React.FC = () => {
  return (
    <div 
      className="w-full h-full relative overflow-hidden flex items-center justify-center border-2 border-zinc-700 bg-zinc-900/50 p-4 pixel-corners"
      data-testid="side-ad-banner"
    >
      {/* Retro Effects */}
      <div className="absolute inset-0 crt-overlay pointer-events-none z-10" />
      <div className="scanline z-10" />
      
      {/* Ad Content */}
      <div className="text-center relative z-0">
        <div className="mb-2 opacity-50">
          <div className="w-12 h-12 mx-auto border-2 border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-700 font-mono text-xl">?</span>
          </div>
        </div>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest animate-pulse-slow">
          Coming Soon
        </p>
        <p className="text-zinc-700 font-mono text-xs mt-2 uppercase">
          Ad Space Available
        </p>
      </div>
    </div>
  );
};