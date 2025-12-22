'use client';

import { GenreBreakdownCard as GenreBreakdownCardType } from '@/types';
import { Swords, Target, Sparkles, Gamepad, Trophy, Zap } from 'lucide-react';

// Genre icon and color mapping
const genreConfig: Record<string, { icon: typeof Swords; color: string; colorClass: string }> = {
  'RPG': { icon: Swords, color: '#D946EF', colorClass: 'text-fuchsia-500' },
  'Action': { icon: Zap, color: '#D946EF', colorClass: 'text-fuchsia-500' },
  'Shooter': { icon: Target, color: '#F43F5E', colorClass: 'text-rose-500' },
  'FPS': { icon: Target, color: '#F43F5E', colorClass: 'text-rose-500' },
  'Simulation': { icon: Sparkles, color: '#10B981', colorClass: 'text-emerald-500' },
  'Indie': { icon: Gamepad, color: '#F59E0B', colorClass: 'text-amber-500' },
  'Strategy': { icon: Trophy, color: '#3B82F6', colorClass: 'text-blue-500' },
  'Adventure': { icon: Sparkles, color: '#8B5CF6', colorClass: 'text-violet-500' },
  'Sports': { icon: Trophy, color: '#14B8A6', colorClass: 'text-teal-500' },
  'Racing': { icon: Zap, color: '#EF4444', colorClass: 'text-red-500' },
  'Puzzle': { icon: Sparkles, color: '#A855F7', colorClass: 'text-purple-500' },
  'Platformer': { icon: Gamepad, color: '#F97316', colorClass: 'text-orange-500' },
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
  return { icon: Gamepad, color: '#F59E0B', colorClass: 'text-amber-500' };
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
      <div className="absolute inset-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl uppercase tracking-widest flex items-center justify-center gap-2"
            style={{
              textShadow: '2px 2px 0px hsl(var(--primary) / 0.5)'
            }}>
          <span className="text-accent">
            <Sparkles className="inline-block w-8 h-8 md:w-10 md:h-10" />
          </span>
          Genre Breakdown
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md group relative z-10">
        <div className="relative bg-card border-4 border-border p-1 shadow-xl hover:-translate-y-2 transition-transform duration-300"
             style={{
               clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
             }}>
          
          {/* Inner card */}
          <div className="relative bg-card/50 border-2 border-border/50 p-6 flex flex-col overflow-hidden min-h-[500px]">
            
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-36 h-36 rotate-12" />
            </div>

            {/* Top badges */}
            <div className="flex justify-between items-center mb-8">
              <span className="inline-block bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 uppercase tracking-widest border-2 border-foreground"
                    style={{
                      boxShadow: '2px 2px 0px hsl(var(--foreground))'
                    }}>
                Multi-Class
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-muted-foreground font-headline text-xs uppercase">Online</span>
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
                        <Icon className="w-5 h-5" />
                        <span className="font-headline text-xs md:text-sm uppercase">
                          {item.genre}
                        </span>
                      </div>
                      <span className="font-body text-2xl font-bold">
                        {percentage}%
                      </span>
                    </div>
                    
                    {/* Progress bar with striped pattern */}
                    <div className="h-8 w-full bg-muted border-2 border-foreground/60 p-1 shadow-inner overflow-hidden"
                         style={{
                           clipPath: 'polygon(0px 2px, 2px 2px, 2px 0px, calc(100% - 2px) 0px, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0px calc(100% - 2px))'
                         }}>
                      <div 
                        className="h-full border-r-2 border-foreground/30 relative group-hover/item:brightness-110 transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: config.color,
                          backgroundImage: 'linear-gradient(45deg, rgba(0, 0, 0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.1) 75%, transparent 75%, transparent)',
                          backgroundSize: '8px 8px'
                        }}>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-white opacity-0 group-hover/item:opacity-20 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats footer */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-border pt-6 mt-8">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-body">
                  Dominant Style
                </span>
                <div className={`font-headline text-sm md:text-base ${getGenreConfig(dominantGenre.genre).colorClass}`}>
                  {dominantGenre.genre}
                </div>
              </div>
              <div className="flex flex-col items-center border-l-2 border-dashed border-border">
                <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1 font-body">
                  Variety Bonus
                </span>
                <div className="text-accent font-headline text-sm md:text-base">
                  +{processedData.length * 100} XP
                </div>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <div className="bg-foreground text-background py-3 px-4 text-center cursor-pointer hover:bg-primary transition-colors duration-200">
            <span className="font-headline text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              View Full Stats
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-black/20 dark:bg-black/50 -z-10 transform translate-y-2"
             style={{
               clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
             }}>
        </div>
      </div>
    </div>
  );
}
