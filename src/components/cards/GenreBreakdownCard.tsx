'use client';

import { GenreBreakdownCard as GenreBreakdownCardType } from '@/types';
import { Swords, Target, Sparkles, Gamepad, Trophy, Zap } from 'lucide-react';

// Genre icon and color mapping
const genreConfig: Record<string, { icon: typeof Swords; colorClass: string; barBg: string }> = {
  'RPG': { icon: Swords, colorClass: 'text-fuchsia-600 dark:text-fuchsia-400', barBg: 'bg-fuchsia-500' },
  'Action': { icon: Zap, colorClass: 'text-pink-600 dark:text-pink-400', barBg: 'bg-pink-500' },
  'Shooter': { icon: Target, colorClass: 'text-rose-600 dark:text-rose-400', barBg: 'bg-rose-500' },
  'FPS': { icon: Target, colorClass: 'text-rose-600 dark:text-rose-400', barBg: 'bg-rose-500' },
  'Simulation': { icon: Sparkles, colorClass: 'text-emerald-600 dark:text-emerald-400', barBg: 'bg-emerald-500' },
  'Indie': { icon: Gamepad, colorClass: 'text-amber-600 dark:text-amber-400', barBg: 'bg-amber-500' },
  'Strategy': { icon: Trophy, colorClass: 'text-blue-600 dark:text-blue-400', barBg: 'bg-blue-500' },
  'Adventure': { icon: Sparkles, colorClass: 'text-violet-600 dark:text-violet-400', barBg: 'bg-violet-500' },
  'Sports': { icon: Trophy, colorClass: 'text-teal-600 dark:text-teal-400', barBg: 'bg-teal-500' },
  'Racing': { icon: Zap, colorClass: 'text-red-600 dark:text-red-400', barBg: 'bg-red-500' },
  'Puzzle': { icon: Sparkles, colorClass: 'text-purple-600 dark:text-purple-400', barBg: 'bg-purple-500' },
  'Platformer': { icon: Gamepad, colorClass: 'text-orange-600 dark:text-orange-400', barBg: 'bg-orange-500' },
};

function getGenreConfig(genre: string) {
  // Check for exact matches first
  if (genreConfig[genre]) return genreConfig[genre];

  // Check for partial matches (e.g., "RPG / Action" should match "RPG")
  for (const [key, config] of Object.entries(genreConfig)) {
    if (genre.toLowerCase().includes(key.toLowerCase())) {
      return config;
    }
  }

  // Default fallback
  return { icon: Gamepad, colorClass: 'text-amber-600 dark:text-amber-400', barBg: 'bg-amber-500' };
}

export function GenreBreakdownCard({ card }: { card: GenreBreakdownCardType }) {
  // Process data: top 4 genres, rest goes to "Other"
  const sorted = [...card.data].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 4);
  const remainder = sorted.slice(4);
  const otherCount = remainder.reduce((sum, cur) => sum + cur.count, 0);
  const processedData = otherCount > 0 ? [...top, { genre: 'Other', count: otherCount }] : top;

  const totalGames = processedData.reduce((sum, item) => sum + item.count, 0);
  const dominantGenre = processedData[0];

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          <Sparkles className="inline-block w-8 h-8 md:w-10 md:h-10 text-accent animate-pulse" />
          Genre Breakdown
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md group relative z-10">
        <div className="relative bg-card border-4 border-border p-1 shadow-xl hover:-translate-y-2 transition-transform duration-300 pixel-corners">

          {/* Inner card */}
          <div className="relative bg-card/50 border-2 border-border/50 p-6 flex flex-col overflow-hidden min-h-[500px]">

            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none text-foreground">
              <Sparkles className="w-36 h-36 rotate-12" />
            </div>

            {/* Top badges */}
            <div className="flex justify-between items-center mb-8">
              <span className="inline-block bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 uppercase tracking-widest border-2 border-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Multi-Class
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-muted-foreground font-headline text-[10px] uppercase tracking-wider">Analysis Live</span>
              </div>
            </div>

            {/* Genre bars */}
            <div className="flex flex-col gap-6 relative z-10 flex-grow justify-center">
              {processedData.map((item, index) => {
                const percentage = ((item.count / totalGames) * 100).toFixed(0);
                const config = getGenreConfig(item.genre);
                const Icon = config.icon;

                return (
                  <div key={item.genre} className="w-full group/item">
                    {/* Genre label and percentage */}
                    <div className="flex justify-between items-end mb-2">
                      <div className={`flex items-center gap-3 ${config.colorClass}`}>
                        <Icon className="w-5 h-5 transition-transform group-hover/item:scale-110" />
                        <span className="font-headline text-xs md:text-sm uppercase tracking-tight">
                          {item.genre}
                        </span>
                      </div>
                      <span className="font-headline text-lg md:text-xl text-foreground">
                        {percentage}%
                      </span>
                    </div>

                    {/* Progress bar with striped pattern */}
                    <div className="h-10 w-full bg-secondary border-2 border-border p-1 shadow-inner overflow-hidden pixel-corners">
                      <div
                        className={`h-full border-r-2 border-black/10 relative group-hover/item:brightness-110 transition-all duration-700 ${config.barBg}`}
                        style={{
                          width: `${percentage}%`,
                          backgroundImage: 'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
                          backgroundSize: '12px 12px'
                        }}>
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:animate-[shimmer_2s_infinite] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats footer */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-border pt-6 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-[8px] uppercase tracking-widest mb-1 font-body font-bold">
                  Main Class
                </span>
                <div className={`font-headline text-xs md:text-sm uppercase ${getGenreConfig(dominantGenre.genre).colorClass}`}>
                  {dominantGenre.genre}
                </div>
              </div>
              <div className="flex flex-col items-center border-l-2 border-dashed border-border">
                <span className="text-muted-foreground text-[8px] uppercase tracking-widest mb-1 font-body font-bold">
                  Variety Multiplier
                </span>
                <div className="text-accent font-headline text-xs md:text-sm">
                  x{(processedData.length * 0.5).toFixed(1)} DMG
                </div>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <div className="bg-foreground text-background py-3 px-4 text-center cursor-pointer hover:bg-primary transition-colors duration-200">
            <span className="font-headline text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              View Extended Dossier
            </span>
          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
      </div>
    </div>
  );
}
