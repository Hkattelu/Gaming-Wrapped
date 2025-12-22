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

// Vibrant retro colors for each platform
const platformColors = [
  { bg: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-400' },      // Cyan
  { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' },      // Hot Pink
  { bg: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400' }, // Yellow
  { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' }, // Purple
  { bg: 'bg-green-400', text: 'text-green-400', border: 'border-green-400' },    // Green
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
      <div className="absolute inset-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl uppercase tracking-widest flex items-center justify-center gap-2"
            style={{
              textShadow: '2px 2px 0px hsl(var(--primary) / 0.5)'
            }}>
          <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          {card.title}
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-card border-4 border-border shadow-2xl"
             style={{
               clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
             }}>
          
          {/* Inner card */}
          <div className="bg-card/50 border-2 border-border/50 p-8">
            
            {/* Badge and Total */}
            <div className="flex items-start justify-between mb-6">
              <div className="bg-accent text-accent-foreground font-headline text-xs px-3 py-1.5 uppercase tracking-widest border-2 border-foreground"
                   style={{
                     boxShadow: '2px 2px 0px hsl(var(--foreground))'
                   }}>
                Yearly Recap
              </div>
              <div className="text-right">
                <div className="text-muted-foreground text-sm uppercase font-body">Total Games</div>
                <div className="text-primary font-headline text-3xl md:text-4xl mt-1">{totalGames}</div>
              </div>
            </div>

            {/* Section Title */}
            <h2 className="font-headline text-xl md:text-2xl uppercase mb-6 tracking-wide">
              System<br/>Breakdown
            </h2>

            {/* Stacked Bar Chart */}
            <div className="mb-8">
              <div className="flex h-12 w-full border-4 border-foreground overflow-hidden"
                   style={{
                     clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
                   }}>
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
              
              {/* Percentage labels */}
              <div className="flex justify-between text-xs text-muted-foreground font-body mt-2 px-1">
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
                  <div key={platform.platform} className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center ${colors.bg} border-2 border-foreground`}
                         style={{
                           clipPath: 'polygon(0px 2px, 2px 2px, 2px 0px, calc(100% - 2px) 0px, calc(100% - 2px) 2px, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 2px calc(100% - 2px), 0px calc(100% - 2px))'
                         }}>
                      <Icon className="w-5 h-5 text-foreground" />
                    </div>

                    {/* Platform Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base md:text-lg truncate">
                          {platform.platform}
                        </span>
                        <span className="text-sm text-muted-foreground font-body whitespace-nowrap">
                          {platform.count} Games
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative h-6 bg-muted border-2 border-foreground/20 overflow-hidden">
                        <div 
                          className={`h-full ${colors.bg} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Percentage */}
                    <div className={`font-headline text-xl md:text-2xl ${colors.text} min-w-[60px] text-right`}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Share Button */}
          <div className="bg-foreground text-background py-3 px-4 text-center cursor-pointer hover:bg-primary transition-colors duration-200 uppercase">
            <span className="font-headline text-xs tracking-widest animate-pulse">Share Stats</span>
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
