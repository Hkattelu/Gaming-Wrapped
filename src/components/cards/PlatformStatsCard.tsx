'use client';

import { PlatformStatsCard as PlatformStatsCardType } from '@/types';
import { Monitor, Gamepad2, Smartphone, Cpu } from 'lucide-react';

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

export function PlatformStatsCard({ card }: { card: PlatformStatsCardType }) {
  const topPlatforms = card.data.slice(0, 4);
  const totalGames = card.data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, oklch(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--primary) / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          {card.title}
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-card border-4 border-border shadow-2xl pixel-corners">

          {/* Inner card */}
          <div className="bg-card/50 border-2 border-border/50 p-8">

            {/* Title and Total */}
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-headline text-xl md:text-2xl text-foreground uppercase mb-6 tracking-wide">
                System<br />Breakdown
              </h2>
              <div className="text-right">
                <div className="text-muted-foreground text-sm uppercase font-body font-bold tracking-wider">Total Games</div>
                <div className="text-primary font-headline text-3xl md:text-4xl mt-1 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.1)]">{totalGames}</div>
              </div>
            </div>

            {/* Stacked Bar Chart */}
            <div className="mb-8 overflow-hidden">
              <div className="flex h-12 w-full border-4 border-foreground pixel-corners overflow-hidden shadow-inner">
                {topPlatforms.map((platform, index) => {
                  const percentage = (platform.count / totalGames) * 100;
                  const colors = platformColors[index % platformColors.length];
                  return (
                    <div
                      key={platform.platform}
                      className={`${colors.bg} transition-all hover:brightness-110`}
                      style={{ width: `${percentage}%` }}
                      title={`${platform.platform}: ${percentage.toFixed(0)}%`}
                    />
                  );
                })}
              </div>

              {/* Percentage labels split across more markers for precision */}
              <div className="flex justify-between text-[10px] text-muted-foreground font-headline mt-2 px-1 tracking-tighter">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Platform List */}
            <div className="space-y-4">
              {topPlatforms.map((platform, index) => {
                const Icon = getPlatformIcon(platform.platform);
                const percentage = ((platform.count / totalGames) * 100).toFixed(0);
                const colors = platformColors[index % platformColors.length];

                return (
                  <div key={platform.platform} className="flex items-center gap-4 group/item">
                    {/* Icon */}
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${colors.bg} border-2 border-foreground pixel-corners shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform group-hover/item:scale-110`}
                      style={{
                        imageRendering: 'pixelated'
                      }}>
                      <Icon className="w-5 h-5 text-white dark:text-background" />
                    </div>

                    {/* Platform Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-headline text-sm md:text-base text-foreground truncate uppercase">
                          {platform.platform}
                        </span>
                        <span className="text-xs text-muted-foreground font-body whitespace-nowrap">
                          {platform.count} Games
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative h-6 bg-secondary border border-border pixel-corners overflow-hidden">
                        <div
                          className={`h-full ${colors.bg} transition-all duration-700 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Percentage */}
                    <div className={`font-headline text-lg md:text-xl ${colors.text} min-w-[60px] text-right drop-shadow-sm`}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
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
