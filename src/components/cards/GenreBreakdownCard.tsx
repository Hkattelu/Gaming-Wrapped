'use client';

import { GenreBreakdownCard as GenreBreakdownCardType } from '@/types';
import { Swords, Target, Sparkles, Gamepad, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export function GenreBreakdownCard({ card, isActive }: { card: GenreBreakdownCardType, isActive?: boolean }) {
  // Process data: top 4 genres, rest goes to "Other"
  const sorted = [...card.data].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 4);
  const remainder = sorted.slice(4);
  const otherCount = remainder.reduce((sum, cur) => sum + cur.count, 0);
  const processedData = otherCount > 0 ? [...top, { genre: 'Other', count: otherCount }] : top;

  const totalGames = processedData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-retro-grid-40" />

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          Genre Conquest
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          The genres you dominated this year.
        </p>
      </div>

      {/* Main Map Container */}
      <div className="w-full max-w-4xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedData.map((item, index) => {
            const percentage = ((item.count / totalGames) * 100).toFixed(0);
            const config = getGenreConfig(item.genre);
            const Icon = config.icon;

            return (
              <motion.div
                key={item.genre}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  scale: isActive ? 1 : 0.8, 
                  y: isActive ? 0 : 20 
                }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative bg-card border-4 border-border p-4 pixel-corners hover:-translate-y-1 transition-transform shadow-lg group-hover:border-accent">
                  <div className="flex items-center gap-4">
                    {/* Territory Icon */}
                    <div className={cn(
                      "w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-foreground pixel-corners shadow-[2px_2px_0px_rgba(0,0,0,1)]",
                      config.barBg
                    )}>
                      <Icon className="w-6 h-6 text-white dark:text-background" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-end mb-1">
                        <span className={cn("font-headline text-xs uppercase truncate", config.colorClass)}>
                          {item.genre}
                        </span>
                        <span className="font-headline text-lg text-foreground">{percentage}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-4 w-full bg-secondary border-2 border-border p-0.5 pixel-corners shadow-inner overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isActive ? `${percentage}%` : 0 }}
                          transition={{ duration: 1, ease: "circOut", delay: 0.5 + (index * 0.1) }}
                          className={cn("h-full bar-pattern", config.barBg)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Shadow layer */}
                <div className="absolute -bottom-2 left-2 right-[-4px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-1 pixel-corners" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
