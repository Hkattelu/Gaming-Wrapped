'use client';

import { PlatformStatsCard as PlatformStatsCardType } from '@/types';
import { Monitor, Gamepad2, Smartphone, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Platform icon mapping
const platformIcons: Record<string, typeof Monitor> = {
  'PC': Monitor,
  'Steam': Monitor,
  'PlayStation': Gamepad2,
  'PS4': Gamepad2,
  'PS5': Gamepad2,
  'Xbox': Gamepad2,
  'Switch': Gamepad2,
  'Nintendo Switch': Gamepad2,
  'Mobile': Smartphone,
  'iOS': Smartphone,
  'Android': Smartphone,
};

// Vibrant retro colors for each platform - now using adaptive classes
const platformColors = [
  { bg: 'bg-cyan-600 dark:bg-cyan-400', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-500' },
  { bg: 'bg-pink-600 dark:bg-pink-500', text: 'text-pink-700 dark:text-pink-500', border: 'border-pink-500' },
  { bg: 'bg-amber-600 dark:bg-yellow-400', text: 'text-amber-700 dark:text-yellow-400', border: 'border-amber-500' },
  { bg: 'bg-purple-600 dark:bg-purple-500', text: 'text-purple-700 dark:text-purple-500', border: 'border-purple-500' },
  { bg: 'bg-emerald-600 dark:bg-green-400', text: 'text-emerald-700 dark:text-green-400', border: 'border-emerald-500' },
];

function getPlatformIcon(platform: string) {
  const Icon = platformIcons[platform] || Cpu;
  return Icon;
}

export function PlatformStatsCard({ card, isActive }: { card: PlatformStatsCardType, isActive?: boolean }) {
  const topPlatforms = card.data.slice(0, 4);
  const totalGames = card.data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-retro-grid-40" />

      {/* Header */}
      <div className="text-center space-y-4 mb-12 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          System Analysis
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Laboratory Container */}
      <div className="w-full max-w-4xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {topPlatforms.map((platform, index) => {
            const Icon = getPlatformIcon(platform.platform);
            const percentage = ((platform.count / totalGames) * 100).toFixed(0);
            const colors = platformColors[index % platformColors.length];

            return (
              <motion.div
                key={platform.platform}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ 
                  opacity: isActive ? 1 : 0, 
                  scale: isActive ? 1 : 0.9, 
                  y: isActive ? 0 : 30 
                }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="relative bg-card border-4 border-border p-6 pixel-corners shadow-xl group hover:-translate-y-1 transition-transform">
                  
                  {/* Unit Identification */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 flex items-center justify-center border-4 border-foreground pixel-corners shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-colors group-hover:scale-110",
                        colors.bg
                      )}>
                        <Icon className="w-6 h-6 text-white dark:text-background" />
                      </div>
                      <div>
                        <span className="font-headline text-[8px] text-muted-foreground uppercase block tracking-tighter">Hardware ID</span>
                        <span className="font-headline text-sm md:text-base text-foreground uppercase">{platform.platform}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-headline text-[8px] text-muted-foreground uppercase block tracking-tighter">Usage Log</span>
                      <span className="font-headline text-lg md:text-xl text-primary">{platform.count} UNITS</span>
                    </div>
                  </div>

                  {/* Frequency Visualizer */}
                  <div className="relative h-12 bg-secondary border-4 border-foreground pixel-corners overflow-hidden mb-4 shadow-inner">
                    {/* Scanning Animation */}
                    {isActive && (
                      <motion.div 
                        initial={{ left: "-10%" }}
                        animate={{ left: "110%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 bottom-0 w-1 bg-white opacity-20 z-20 blur-sm"
                      />
                    )}
                    
                    {/* Level Bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: isActive ? `${percentage}%` : 0 }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.5 + (index * 0.1) }}
                      className={cn("h-full relative", colors.bg)}
                    >
                      <div className="absolute inset-0 bar-pattern opacity-30" />
                      {/* Glow segment */}
                      <div className="absolute top-0 right-0 bottom-0 w-2 bg-white opacity-40 animate-pulse" />
                    </motion.div>
                  </div>

                  {/* Percentage Readout */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={cn(
                          "w-2 h-2 rounded-full", 
                          parseInt(percentage) > (i * 20) ? colors.bg : "bg-muted"
                        )} />
                      ))}
                    </div>
                    <span className={cn("font-headline text-2xl drop-shadow-sm", colors.text)}>
                      {percentage}<span className="text-xs opacity-70 ml-0.5">%</span>
                    </span>
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
