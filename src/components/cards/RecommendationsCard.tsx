"use client";

import { RecommendationsCard, Recommendation } from "@/types";
import {
  Rocket,
  Shield,
  Gamepad2,
  Sparkles,
  Compass,
  Map,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";

interface RecommendationsCardProps {
  card: RecommendationsCard;
  isActive?: boolean;
}

interface RecommendationWithUrl extends Recommendation {
  igdbUrl?: string;
  imageUrl?: string;
  rating?: number;
}

const ACCENT_COLORS = [
  { text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30", shadow: "shadow-cyan-500/10", icon: Rocket, bg: "bg-cyan-500/10" },
  { text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30", shadow: "shadow-amber-500/10", icon: Shield, bg: "bg-amber-500/10" },
  { text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30", shadow: "shadow-purple-500/10", icon: Gamepad2, bg: "bg-purple-500/10" },
  { text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30", shadow: "shadow-emerald-500/10", icon: Sparkles, bg: "bg-emerald-500/10" },
];

export function RecommendationsCardComponent({ card, isActive }: RecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithUrl[]>(
    card.recommendations.map(rec => ({ ...rec }))
  );

  useEffect(() => {
    async function fetchIgdbUrls() {
      const updated = await Promise.all(
        card.recommendations.map(async (rec) => {
          if (rec.igdbUrl && rec.imageUrl) return rec;
          try {
            const res = await fetch('/api/igdb/game', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: rec.game }),
            });
            const data = await res.json();
            return {
              ...rec,
              igdbUrl: data.url ?? rec.igdbUrl,
              imageUrl: data.imageUrl ?? undefined,
              rating: data.rating ?? undefined
            };
          } catch {
            return rec;
          }
        })
      );
      setRecommendations(updated);
    }
    fetchIgdbUrls();
  }, [card.recommendations]);

  return (
    <div className="h-[550px] w-full flex flex-col items-center gap-6 p-4 perspective-1000">
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl md:text-3xl text-foreground uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)] flex items-center justify-center gap-3">
          Your Recommendations
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-body">
          Curated games based on your playstyle.
        </p>
      </div>

      <div className="w-full max-w-lg group relative">
        {/* Shadow layer */}
        <div className="absolute -bottom-2 -right-2 h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 pixel-corners translate-y-2" />

        <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
          <div className="relative bg-card/50 border-2 border-border/50 p-4 md:p-6 flex flex-col items-center min-h-[400px] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 quest-pattern opacity-10 pointer-events-none" />

            {/* Large background icon */}
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
              <motion.div
                animate={{ rotate: isActive ? [0, 360] : 0 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Compass className="w-48 h-48 text-foreground" />
              </motion.div>
            </div>

            <div className="relative z-10 mb-6 w-full text-center flex flex-col items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: isActive ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="p-2 bg-primary/20 rounded-full"
              >
                <Map className="w-6 h-6 text-primary" />
              </motion.div>
            </div>

            <div className="w-full flex flex-col gap-3 relative z-10 flex-grow justify-center">
              {recommendations.slice(0, 3).map((rec, index) => {
                const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
                const Icon = accent.icon;
                const Wrapper = rec.igdbUrl ? "a" : "div";
                const wrapperProps = rec.igdbUrl ? {
                  href: rec.igdbUrl,
                  target: "_blank",
                  rel: "noopener noreferrer"
                } : {};

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -30, scale: isActive ? 1 : 0.9 }}
                    transition={{ duration: 0.5, delay: 0.3 + (index * 0.15) }}
                    whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="w-full"
                  >
                    <Wrapper
                      {...wrapperProps}
                      className={cn(
                        "group/item flex items-center gap-4 p-3 pixel-corners transition-all border-2 border-transparent hover:border-accent/30 w-full relative overflow-hidden bg-card/30",
                        rec.igdbUrl ? "cursor-pointer" : "cursor-default"
                      )}
                    >
                      {/* Background accent glow on hover */}
                      <div className={cn("absolute inset-0 opacity-0 group-hover/item:opacity-10 transition-opacity", accent.bg)} />

                      <div className={cn(
                        "flex-shrink-0 w-16 h-24 border-2 overflow-hidden pixel-corners shadow-lg transition-transform group-hover/item:scale-105 z-10",
                        accent.border,
                        accent.shadow
                      )}>
                        {rec.imageUrl ? (
                          <Image
                            src={rec.imageUrl}
                            alt={rec.game}
                            width={64}
                            height={96}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                            unoptimized
                          />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center", accent.bg)}>
                            <Icon className={cn("w-6 h-6", accent.text)} />
                          </div>
                        )}
                        <div className="absolute inset-0 crt-overlay opacity-20 pointer-events-none" />
                      </div>

                      <div className="flex-grow min-w-0 text-left z-10">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={cn(
                            "font-headline text-xs md:text-sm leading-tight transition-colors flex items-center gap-1 min-w-0",
                            accent.text
                          )}>
                            <span className="truncate">{(rec.game ?? 'UNKNOWN GAME').toUpperCase()}</span>
                            {rec.igdbUrl && <ExternalLink className="w-3 h-3 opacity-50 shrink-0 group-hover/item:opacity-100" />}
                          </h3>
                        </div>
                        <p className="font-body text-xs md:text-lg text-foreground leading-relaxed line-clamp-2 italic">
                          &quot;{rec.blurb}&quot;
                        </p>
                      </div>
                    </Wrapper>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="bg-secondary text-muted-foreground py-2 px-4 text-center flex justify-between items-center group/btn border-t border-border">
            <span className="font-headline text-[8px] uppercase tracking-widest animate-pulse group-hover/btn:animate-none group-hover/btn:text-primary transition-colors">
              READY TO PLAY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
