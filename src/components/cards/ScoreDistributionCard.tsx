'use client';
import { ScoreDistributionCard as ScoreDistributionCardType } from '@/types';
import { Star, Hotel, StarHalf, PlayCircle, ShieldCheck, Zap, Trophy, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

// More comprehensive category mapping
function getScoreCategory(range: string) {
  const parts = range.split(/[ -]/); // Handle "9-10", "9 10", "9"
  const rawVal = parts.length > 1
    ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
    : parseFloat(range);

  // Normalize to 10-point scale if it looks like a 100-point scale
  const val = rawVal > 10 ? rawVal / 10 : rawVal;

  if (val >= 9.5) return { label: "Masterpiece", color: "bg-yellow-400 text-yellow-500", icon: Hotel };
  if (val >= 8.5) return { label: "Elite", color: "bg-fuchsia-500 text-fuchsia-500", icon: Trophy };
  if (val >= 7.5) return { label: "Great", color: "bg-blue-500 text-blue-500", icon: Star };
  if (val >= 6.5) return { label: "Solid", color: "bg-emerald-500 text-emerald-500", icon: StarHalf };
  if (val >= 4.5) return { label: "Mixed", color: "bg-orange-500 text-orange-500", icon: TrendingUp };
  return { label: "Rough", color: "bg-slate-500 text-slate-500", icon: Zap };
}

export function ScoreDistributionCard({ card, isActive }: { card: ScoreDistributionCardType, isActive?: boolean }) {
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

  const weightedSum = chartData.reduce((acc, item) => {
    const parts = item.range.split(/[ -]/);
    const val = parts.length > 1
      ? (parseFloat(parts[0]) + parseFloat(parts[1])) / 2
      : parseFloat(item.range);
    return acc + (val || 0) * item.count;
  }, 0);

  const rawAvg = totalCount > 0 ? (weightedSum / totalCount) : 0;
  const avg = rawAvg > 10 ? rawAvg / 10 : rawAvg;
  const averageScore = rawAvg > 0 ? rawAvg.toFixed(1) : "N/A";

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

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          Power Rankings
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          The critical verdict of your gaming year.
        </p>
      </div>

      {/* Main Board Container */}
      <div className="w-full max-w-2xl relative z-10">
        <div className="relative bg-card border-4 border-border p-6 md:p-10 pixel-corners shadow-2xl">
          
          {/* Average Score Badge */}
          <div className="absolute bottom-25 left-1/2 -translate-x-1/2 z-20">
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: isActive ? 1 : 0, rotate: isActive ? -2 : -10 }}
              className="bg-accent text-accent-foreground font-headline text-sm md:text-base px-6 py-2 uppercase tracking-tighter border-4 border-foreground shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              Avg Grade: {averageScore}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {sortedData.map((item, index) => {
              const config = getScoreCategory(item.range);
              const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
              
              // Map ranges to Arcade-style Ranks
              const rankMap: Record<string, string> = {
                "9-10": "S",
                "7-8": "A",
                "5-6": "B",
                "3-4": "C",
                "0-2": "F"
              };
              const rankLabel = rankMap[item.range] || "D";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0, 
                    x: isActive ? 0 : -50 
                  }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-6 group"
                >
                  {/* Rank Badge */}
                  <div className={cn(
                    "w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center border-4 border-foreground pixel-corners shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform",
                    config.color.split(' ')[0]
                  )}>
                    <span className="font-headline text-3xl md:text-4xl text-black drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">
                      {rankLabel}
                    </span>
                  </div>

                  {/* Info and Bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex flex-col">
                        <span className="font-headline text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest">
                          {config.label} Class
                        </span>
                        <span className="font-headline text-sm md:text-base text-foreground uppercase">
                          Score {item.range}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-headline text-xl md:text-2xl text-foreground">{percentage}%</span>
                      </div>
                    </div>

                    <div className="h-6 w-full bg-secondary border-2 border-border p-0.5 pixel-corners overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isActive ? `${percentage}%` : 0 }}
                        transition={{ duration: 1, ease: "circOut", delay: 0.5 + (index * 0.1) }}
                        className={cn("h-full bar-pattern", config.color.split(' ')[0])}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Persona Insight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
            transition={{ delay: 1 }}
            className="mt-10 pt-6 border-t-4 border-dashed border-border flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 pixel-corners border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_black]", personaColor)}>
                <span className="font-headline text-xl text-black">{personaTag}</span>
              </div>
              <div className="text-center md:text-left">
                <p className="text-[10px] font-headline text-muted-foreground uppercase">Critical Rating</p>
                <p className="font-headline text-sm text-foreground uppercase">{persona}</p>
              </div>
            </div>
            <div className="bg-foreground/5 px-4 py-2 pixel-corners border border-border">
               <p className="text-[8px] font-headline text-accent animate-pulse uppercase">Verdict: {avg >= 8 ? "Peak Taste" : "Mixed Signals"}</p>
            </div>
          </motion.div>

        </div>
        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
      </div>
    </div>
  );
}
