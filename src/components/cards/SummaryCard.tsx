'use client';

import { Gamepad2, Trophy, BarChart3, Share2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { useState } from 'react';

export function SummaryCard({ card, isActive, id }: { card: SummaryCardType, isActive?: boolean, id?: string | null }) {
  const [isPreviewPro, setIsPreviewPro] = useState(false);
  
  // Calculate completion rate (assuming 8+ is "completed")
  const completionRate = card.completionPercentage ?? (card.averageScore >= 7 ? 75 : 60);

  // Use real total playtime if available, otherwise estimate
  const totalHours = card.totalPlaytime 
    ? Math.round(card.totalPlaytime / 60) 
    : Math.round(card.totalGames * 25);

  const showAverageScore = card.averageScore > 0;

  const rankColors: Record<string, string> = {
    "BRONZE": "bg-[#cd7f32] text-white",
    "SILVER": "bg-[#c0c0c0] text-black",
    "GOLD": "bg-[#fbbf24] text-black",
    "PLATINUM": "bg-[#e5e4e2] text-black",
    "DIAMOND": "bg-[#b9f2ff] text-black shadow-[0_0_15px_rgba(185,242,255,0.5)]",
    "MASTER": "bg-primary text-white shadow-[0_0_20px_rgba(255,46,80,0.6)] animate-pulse",
  };

  const currentRankColor = rankColors[card.rank || "BRONZE"] || "bg-muted text-muted-foreground";

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-retro-grid-40" />

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <div className="flex flex-col items-center gap-2">
          {card.rank && (
            <motion.div
              initial={{ scale: 0, rotate: -20, filter: "brightness(2)" }}
              animate={{ 
                scale: isActive ? 1 : 0, 
                rotate: isActive ? 0 : -20,
                filter: isActive ? "brightness(1)" : "brightness(2)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20, 
                delay: 0.1 
              }}
              className={cn("px-4 py-1 font-headline text-[10px] border-2 border-foreground pixel-corners mb-2 relative group", currentRankColor)}
            >
              {/* Achievement Sparkle */}
              {isActive && (
                <motion.div 
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 border-4 border-white pixel-corners pointer-events-none"
                />
              )}
              {card.rank} RANK
            </motion.div>
          )}
          <h1 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
            {card.title}
          </h1>
        </div>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card Grid Layout for Desktop */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Main Card (Existing) */}
        <div className="group relative">
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
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex flex-col items-center justify-center p-4 bg-background/80 border-2 border-dashed border-border backdrop-blur-sm pixel-corners"
                >
                  <Gamepad2 className="w-10 h-10 text-muted-foreground mb-2" />
                  <h3 className="font-headline text-4xl md:text-5xl text-primary mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                    {card.totalGames}
                  </h3>
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-bold">Games</span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex flex-col items-center justify-center p-4 bg-background/80 border-2 border-dashed border-border backdrop-blur-sm pixel-corners"
                >
                  <Trophy className="w-10 h-10 text-muted-foreground mb-2" />
                  {showAverageScore ? (
                    <>
                      <h3 className="font-headline text-4xl md:text-5xl text-accent mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                        {card.averageScore.toFixed(1)}
                      </h3>
                      <span className="text-muted-foreground text-sm uppercase tracking-wider font-bold">Avg Score</span>
                    </>
                  ) : (
                    <>
                      <h3 className="font-headline text-3xl md:text-4xl text-accent mb-1 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">
                        {totalHours.toLocaleString()}
                      </h3>
                      <span className="text-muted-foreground text-sm uppercase tracking-wider font-bold">Total Hours</span>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Bottom stats panel */}
              <div className="w-full relative z-10 bg-background/40 border border-border p-4 pixel-corners">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      {showAverageScore ? "Estimated Playtime" : "Total Playtime"}
                    </p>
                    <p className="font-headline text-xl text-cyan-600 dark:text-cyan-400">
                      {totalHours.toLocaleString()} <span className="text-sm text-muted-foreground font-body">HRS</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Completion Rate</p>
                    <p className="font-headline text-xl text-emerald-600 dark:text-emerald-400">{completionRate}%</p>
                  </div>
                </div>
                <div className="w-full bg-secondary h-2 mt-3 overflow-hidden pixel-corners">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isActive ? `${completionRate}%` : 0 }}
                    transition={{ duration: 1, ease: "circOut", delay: 0.6 }}
                    className="h-full transition-all duration-1000 bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
        </div>

        {/* Story Preview (Desktop Only) */}
        <div className="hidden lg:flex flex-col gap-4">
          {/* Tier Selector */}
          <div className="flex bg-muted/30 p-1 pixel-corners border-2 border-border w-fit mx-auto">
            <button 
              onClick={() => setIsPreviewPro(false)}
              className={cn(
                "px-4 py-1.5 font-headline text-[8px] transition-all pixel-corners",
                !isPreviewPro ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted"
              )}
            >
              STANDARD
            </button>
            <button 
              onClick={() => setIsPreviewPro(true)}
              className={cn(
                "px-4 py-1.5 font-headline text-[8px] transition-all pixel-corners flex items-center gap-1",
                isPreviewPro ? "bg-[#fbbf24] text-black shadow-md" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Sparkles className="w-3 h-3" /> GOLD EDITION
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 50, rotate: 5 }}
            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 50, rotate: isActive ? (isPreviewPro ? 0 : 3) : 5 }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            onClick={() => id && window.open(`/api/wrapped/${id}/og?pro=${isPreviewPro}&aspect=vertical`, '_blank')}
            className={cn(
              "flex flex-col items-center justify-center p-8 aspect-[9/16] h-[500px] pixel-corners shadow-2xl relative overflow-hidden group cursor-pointer border-4 transition-colors duration-500",
              isPreviewPro ? "bg-[#09090b] border-[#fbbf24]" : "bg-zinc-900 border-accent",
              !id && "cursor-not-allowed opacity-50"
            )}
          >
            <div className="absolute inset-0 bg-retro-grid-40 opacity-20" />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
               <div className="bg-black/80 px-4 py-2 border-2 border-accent pixel-corners text-center">
                  <p className="font-headline text-[10px] text-accent">CLICK TO DOWNLOAD</p>
                  <p className="font-headline text-[8px] text-white mt-1">{isPreviewPro ? "PRO VERSION" : "FREE VERSION"}</p>
               </div>
            </div>

            <div className="relative z-10 text-center space-y-6">
               <div className={cn(
                 "w-20 h-20 mx-auto pixel-corners flex items-center justify-center shadow-[4px_4px_0px_oklch(var(--foreground))] transition-colors",
                 isPreviewPro ? "bg-[#fbbf24]" : "bg-accent"
               )}>
                  <Share2 className={cn("w-10 h-10", isPreviewPro ? "text-black" : "text-zinc-950")} />
               </div>
               <div className="space-y-2">
                  <p className={cn("font-headline text-xs tracking-widest transition-colors", isPreviewPro ? "text-[#fbbf24]" : "text-accent")}>
                    {isPreviewPro ? "PRO EDITION" : "FREE EDITION"}
                  </p>
                  <h3 className="font-headline text-lg text-white uppercase">YOUR YEAR<br/>IN GAMING</h3>
               </div>
               <div className="bg-white/5 border-2 border-white/10 p-4 pixel-corners">
                  <p className={cn("font-headline text-3xl transition-colors", isPreviewPro ? "text-[#fbbf24]" : "text-primary")}>
                    {card.totalGames}
                  </p>
                  <p className="font-headline text-[10px] text-muted-foreground">GAMES PLAYED</p>
               </div>
               
               {isPreviewPro && (
                 <div className="bg-[#fbbf24] text-black px-3 py-1 font-headline text-[8px] rotate-[-5deg] border-2 border-black animate-bounce shadow-lg">
                    SUPPORTER EDITION
                 </div>
               )}

               <p className="font-headline text-[8px] text-accent animate-pulse tracking-tighter">
                 {isPreviewPro ? "REMOVE WATERMARKS" : "CONTAINS WATERMARK"}
               </p>
            </div>
            <div className={cn("absolute bottom-4 font-headline text-[8px] transition-colors", isPreviewPro ? "text-[#fbbf24]" : "text-zinc-700")}>
              GAMINGWRAPPED.COM
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
