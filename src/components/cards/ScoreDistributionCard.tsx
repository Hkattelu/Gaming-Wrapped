'use client';
import { ScoreDistributionCard as ScoreDistributionCardType } from '@/types';
import { Star, Hotel, StarHalf, PlayCircle, ShieldCheck, Zap, Trophy, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

// More comprehensive category mapping
function getScoreCategory(range: string) {
  const parts = range.split(/[ -]/); // Handle "9-10", "9 10", "9"
  const val = parts.length > 1
    ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
    : parseFloat(range);

  if (val >= 9.5) return { label: "Masterpiece", color: "bg-yellow-400 text-yellow-500", icon: Hotel };
  if (val >= 8.5) return { label: "Elite", color: "bg-fuchsia-500 text-fuchsia-500", icon: Trophy };
  if (val >= 7.5) return { label: "Great", color: "bg-blue-500 text-blue-500", icon: Star };
  if (val >= 6.5) return { label: "Solid", color: "bg-emerald-500 text-emerald-500", icon: StarHalf };
  if (val >= 4.5) return { label: "Mixed", color: "bg-orange-500 text-orange-500", icon: TrendingUp };
  return { label: "Rough", color: "bg-slate-500 text-slate-500", icon: Zap };
}

export function ScoreDistributionCard({ card }: { card: ScoreDistributionCardType }) {
  const chartData = card.data;
  const totalCount = chartData.reduce((acc, curr) => acc + curr.count, 0);

  // Sort data (descending by score value)
  const sortedData = [...chartData].sort((a, b) => {
    const getVal = (r: string) => {
      const p = r.split(/[ -]/);
      return p.length > 1 ? (parseFloat(p[0]) + parseFloat(p[1])) / 2 : parseFloat(r);
    };
    return getVal(b.range) - getVal(a.range);
  });

  // Calculate weighted average
  const weightedSum = chartData.reduce((acc, item) => {
    const parts = item.range.split(/[ -]/);
    const val = parts.length > 1
      ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
      : parseFloat(item.range);
    return acc + (val || 0) * item.count;
  }, 0);

  const avg = totalCount > 0 ? (weightedSum / totalCount) : 0;
  const averageScore = avg > 0 ? avg.toFixed(1) : "N/A";

  // Derive Gamer Persona based on average
  let persona = "Gamer";
  let personaTag = "B";
  let personaColor = "bg-blue-400";

  if (avg >= 9) {
    persona = "Elitist Critic";
    personaTag = "S+";
    personaColor = "bg-yellow-400";
  } else if (avg >= 8) {
    persona = "Gold Standards";
    personaTag = "A";
    personaColor = "bg-emerald-400";
  } else if (avg >= 7) {
    persona = "Generous Soul";
    personaTag = "B+";
    personaColor = "bg-blue-400";
  } else if (avg > 0) {
    persona = "Chaos Enjoyer";
    personaTag = "C";
    personaColor = "bg-orange-400";
  }

  // Insight based on distribution
  const masteryCount = chartData.filter(d => {
    const p = d.range.split(/[ -]/);
    const v = p.length > 1 ? (parseFloat(p[0]) + parseFloat(p[1])) / 2 : parseFloat(d.range);
    return v >= 9;
  }).reduce((a, b) => a + b.count, 0);

  const insightLabel = masteryCount / totalCount > 0.5 ? "Elite Heavy" : "Well Balanced";

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          Ratings Breakdown
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          How your year measured up against your own scale.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md group relative z-10 perspective-1000">
        <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-2 duration-300">

          <div className="relative bg-card/50 border-2 border-border/50 p-6 flex flex-col overflow-hidden min-h-[500px]">

            <div className="absolute -top-6 -right-6 p-4 opacity-5 pointer-events-none">
              <Star className="w-32 h-32 text-foreground transform rotate-12" />
            </div>

            {/* Top Badges */}
            <div className="flex justify-between items-center mb-8">
              <span className="inline-block bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 uppercase tracking-widest border-2 border-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Average Score {averageScore}
              </span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-muted-foreground font-headline text-[10px] uppercase tracking-wider">{insightLabel}</span>
              </div>
            </div>

            {/* Bars */}
            <div className="flex flex-col gap-5 relative z-10 flex-grow justify-center">
              {sortedData.map((item, index) => {
                const config = getScoreCategory(item.range);
                const Icon = config.icon;
                const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;

                return (
                  <div key={index} className="w-full group/item">
                    <div className="flex justify-between items-end mb-1.5">
                      <div className={cn("flex items-center gap-2", config.color.split(' ')[1])}>
                        <Icon className="w-4 h-4" />
                        <span className="font-headline text-[10px] md:text-xs uppercase text-foreground">
                          {item.range} Scale : {config.label}
                        </span>
                      </div>
                      <span className="font-body text-xl font-bold text-foreground">{percentage}%</span>
                    </div>

                    <div className="h-6 w-full bg-secondary border-2 border-border p-0.5 pixel-corners shadow-inner">
                      <div
                        className={cn("h-full bar-pattern border-r-2 border-black/30 relative group-hover/item:brightness-110 transition-all duration-300", config.color.split(' ')[0])}
                        style={{ width: `${percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover/item:opacity-20 transition-opacity"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Stats */}
            <div className="flex flex-col items-center border-t-2 border-dashed border-border pt-6 mt-8">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1 font-body font-bold">Taste Persona</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-black font-headline text-sm px-2 py-0.5 border border-black shadow-[1px_1px_0px_black]", personaColor)}>{personaTag}</span>
                <span className="text-foreground font-headline text-[10px] uppercase">{persona}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
      </div>
    </div>
  );
}
