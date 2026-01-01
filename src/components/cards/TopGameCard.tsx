'use client';

import { TopGameCard as TopGameCardType } from '@/types';
import { Gamepad2, Monitor, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function TopGameCard({ card, isActive }: { card: TopGameCardType, isActive?: boolean }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch('/api/igdb/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: card.game.title }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to fetch game image:', err);
      }
    }
    fetchImage();
  }, [card.game.title]);

  const score = Number(card.game.score) || 0;
  const normalizedScore = score > 10 ? score : score * 10;

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-retro-grid-40" />

      {/* Victory Banner */}
      <div className="absolute top-10 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -50, scale: 2 }}
          animate={{ 
            opacity: isActive ? 1 : 0, 
            y: isActive ? 0 : -50,
            scale: isActive ? 1 : 2
          }}
          transition={{ type: "spring", damping: 10, delay: 0.2 }}
          className="bg-primary text-primary-foreground font-headline text-2xl md:text-4xl px-12 py-4 border-y-8 border-foreground shadow-[0_0_30px_rgba(255,46,80,0.5)] rotate-[-2deg]"
        >
          VICTORY!
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-12 relative z-10">
        
        {/* Game Art Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50, rotate: -5 }}
          animate={{ 
            opacity: isActive ? 1 : 0, 
            x: isActive ? 0 : -50,
            rotate: isActive ? -2 : -5
          }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative group justify-self-center md:justify-self-end"
        >
          <motion.div 
            animate={isActive ? {
              x: [0, -2, 2, 0, 1, -1, 0],
              filter: [
                "hue-rotate(0deg)",
                "hue-rotate(0deg)",
                "hue-rotate(90deg)",
                "hue-rotate(0deg)",
                "hue-rotate(-90deg)",
                "hue-rotate(0deg)",
              ]
            } : {}}
            transition={{ 
              duration: 0.4, 
              repeat: Infinity, 
              repeatDelay: 4,
              ease: "linear"
            }}
            className="relative w-64 h-80 bg-card border-8 border-foreground p-1 pixel-corners shadow-2xl overflow-hidden"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={card.game.title}
                width={256}
                height={320}
                className="w-full h-full object-cover rendering-pixelated group-hover:scale-110 transition-transform duration-700"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Gamepad2 className="w-20 h-20 text-muted-foreground opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 crt-overlay opacity-30 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 border-t-4 border-foreground">
               <p className="font-headline text-[8px] text-primary animate-pulse text-center">BOSS DEFEATED</p>
            </div>
          </motion.div>
          {/* Shadow layer */}
          <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
        </motion.div>

        {/* Stats Side */}
        <div className="space-y-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
            transition={{ delay: 0.6 }}
          >
            <span className="font-headline text-xs text-accent uppercase tracking-[0.2em]">Primary Target</span>
            <h2 className="font-headline text-3xl md:text-5xl text-foreground uppercase leading-none mt-2 break-words">
              {card.game.title}
            </h2>
          </motion.div>

          {/* BOSS HP BAR (Score) */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: isActive ? 1 : 0, scaleX: isActive ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="space-y-2 origin-left"
          >
            <div className="flex justify-between items-end font-headline text-[10px] uppercase">
              <span className="text-primary">Engagement Level</span>
              <span className="text-foreground">{score}/10</span>
            </div>
            <div className="h-8 w-full bg-zinc-900 border-4 border-foreground p-1 pixel-corners relative overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: isActive ? `${normalizedScore}%` : 0 }}
                transition={{ duration: 1.5, ease: "circOut", delay: 1 }}
                className="h-full bg-gradient-to-r from-red-600 to-primary relative"
              >
                <div className="absolute inset-0 bar-pattern opacity-30" />
                {/* Glitch Pulse */}
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-pulse" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap gap-4 justify-center md:justify-start pt-4"
          >
            <div className="bg-foreground/5 border-2 border-border p-3 pixel-corners">
              <p className="text-[8px] font-headline text-muted-foreground uppercase">System</p>
              <p className="font-headline text-sm text-foreground flex items-center gap-2 mt-1">
                <Monitor className="w-4 h-4 text-cyan-500" /> {card.game.platform}
              </p>
            </div>
            <div className="bg-foreground/5 border-2 border-border p-3 pixel-corners flex-1 min-w-[200px]">
              <p className="text-[8px] font-headline text-muted-foreground uppercase">Verdict</p>
              <p className="font-body text-sm text-foreground mt-1 line-clamp-3 italic italic-muted">
                &quot;{card.game.notes || "A journey that defined the year."}&quot;
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
