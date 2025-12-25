'use client';

import { TopGameCard as TopGameCardType } from '@/types';
import { Gamepad2, Monitor, ArrowLeft, ArrowRight } from 'lucide-react';

import { useEffect, useState } from 'react';

export function TopGameCard({ card }: { card: TopGameCardType }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch('/api/igdb/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: card.game.title }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to fetch game image:', err);
      }
    }
    fetchImage();
  }, [card.game.title]);

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-retro-grid-40" />

      {/* Header */}
      <div className="text-center space-y-4 mb-12 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          Your Top Pick
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md group relative z-10">
        {/* Card with pixel corners effect */}
        <div className="relative bg-card border-4 border-border p-1 shadow-2xl transition-transform hover:-translate-y-2 duration-300 pixel-corners">

          {/* Inner card content */}
          <div className="relative bg-card/50 border-2 border-border/50 p-6 flex flex-col items-center text-center overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-foreground">
              <Gamepad2 className="w-32 h-32 text-primary rotate-12" />
            </div>

            {/* Top badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-block bg-accent text-accent-foreground font-headline text-xs px-2 py-1 uppercase tracking-widest border-2 border-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                #1 Ranked Game
              </span>
            </div>

            {/* Game Image/Icon Container */}
            <div className="w-48 h-64 mb-6 relative mt-8">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full"></div>

              {/* Image frame */}
              <div className="relative w-full h-full bg-background border-4 border-foreground overflow-hidden shadow-[4px_4px_0px_oklch(var(--primary))] pixel-corners">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={card.game.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center hover:scale-110 transition-transform duration-500">
                    <Gamepad2 className="w-24 h-24 text-foreground/40" />
                  </div>
                )}

                {/* Scanlines effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
              </div>
            </div>

            {/* Game Title */}
            <h2 className="font-headline text-2xl md:text-3xl text-foreground uppercase leading-tight mb-2 tracking-wide drop-shadow-md">
              {card.game.title}
            </h2>

            {/* Platform */}
            {card.game.platform && card.game.platform !== 'N/A' && card.game.platform !== 'Unknown' && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-headline">Platform</span>
                <div className="flex items-center gap-3 text-base md:text-lg text-muted-foreground font-bold font-body uppercase tracking-tight">
                  <span className="flex items-center gap-1">
                    <Monitor className="w-4 h-4" />
                    {card.game.platform}
                  </span>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-1 gap-4 border-t-2 border-dashed border-border pt-6 mt-2">
              {/* Score */}
              {card.game.score && (
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs uppercase font-headline tracking-widest">Score</span>
                  <div className="text-primary font-headline text-2xl md:text-3xl mt-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                    {card.game.formattedScore ? (
                      card.game.formattedScore
                    ) : (
                      <>
                        {Number(card.game.score) > 10
                          ? (Number(card.game.score) / 10).toFixed(1)
                          : card.game.score}
                        <span className="text-sm align-top opacity-70">/10</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
      </div>
    </div>
  );
}
