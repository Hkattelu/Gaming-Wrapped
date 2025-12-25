'use client';

import { SummaryCard as SummaryCardType } from '@/types';
import { Gamepad2, Trophy, BarChart3 } from 'lucide-react';

export function SummaryCard({ card }: { card: SummaryCardType }) {
  // Calculate completion rate (assuming 8+ is "completed")
  const completionRate = card.averageScore >= 7 ? 75 : 60;

  // Estimate total playtime (placeholder calculation)
  const estimatedHours = Math.round(card.totalGames * 25);

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-retro-grid-40" />

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          <span className="text-cyan-600 dark:text-cyan-400">
            <BarChart3 className="inline-block w-8 h-8 md:w-10 md:h-10" />
          </span>
          {card.title}
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg group relative z-10">
        <div className="relative bg-card border-4 border-border p-1 shadow-xl hover:-translate-y-2 transition-transform duration-300 pixel-corners">

          {/* Inner card */}
          <div className="relative bg-card/50 border-2 border-border/50 p-8 flex flex-col items-center text-center overflow-hidden">

            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none text-foreground">
              <BarChart3 className="w-36 h-36 rotate-12" />
            </div>

            {/* Data badge */}
            <div className="relative z-10 mb-8">
              <span className="inline-block bg-accent text-accent-foreground font-headline text-xs px-3 py-1 uppercase tracking-widest border-2 border-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Library Overview
              </span>
            </div>

            {/* Main stats grid */}
            <div className="w-full grid grid-cols-2 gap-6 relative z-10 mb-8">
              {/* Total Games */}
              <div className="flex flex-col items-center justify-center p-4 bg-background/80 border-2 border-dashed border-border backdrop-blur-sm pixel-corners">
                <Gamepad2 className="w-10 h-10 text-muted-foreground mb-2" />
                <h3 className="font-headline text-4xl md:text-5xl text-primary mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                  {card.totalGames}
                </h3>
                <span className="text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  Games
                </span>
              </div>

              {/* Average Score */}
              <div className="flex flex-col items-center justify-center p-4 bg-background/80 border-2 border-dashed border-border backdrop-blur-sm pixel-corners">
                <Trophy className="w-10 h-10 text-muted-foreground mb-2" />
                <h3 className="font-headline text-4xl md:text-5xl text-accent mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                  {card.averageScore.toFixed(1)}
                </h3>
                <span className="text-muted-foreground text-sm uppercase tracking-wider font-bold">
                  Avg Score
                </span>
              </div>
            </div>

            {/* Bottom stats panel */}
            <div className="w-full relative z-10 bg-background/40 border border-border p-4 pixel-corners">
              <div className="flex justify-between items-center text-left">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Total Playtime
                  </p>
                  <p className="font-headline text-xl text-cyan-600 dark:text-cyan-400">
                    {estimatedHours.toLocaleString()} <span className="text-sm text-muted-foreground font-body">HRS</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Completion Rate
                  </p>
                  <p className="font-headline text-xl text-emerald-600 dark:text-emerald-400">
                    {completionRate}%
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-secondary h-2 mt-3 overflow-hidden pixel-corners">
                <div
                  className="h-full transition-all duration-1000 bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${completionRate}%` }}>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners">
        </div>
      </div>
    </div>
  );
}
