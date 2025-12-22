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

interface RecommendationsCardProps {
  card: RecommendationsCard;
}

interface RecommendationWithUrl extends Recommendation {
  igdbUrl?: string;
}

const ACCENT_COLORS = [
  { text: "text-[#00F0FF]", border: "border-[#00F0FF]/50", shadow: "shadow-[#00F0FF]/20", icon: Rocket },
  { text: "text-[#FFE600]", border: "border-[#FFE600]/50", shadow: "shadow-[#FFE600]/20", icon: Shield },
  { text: "text-[#BD00FF]", border: "border-[#BD00FF]/50", shadow: "shadow-[#BD00FF]/20", icon: Gamepad2 },
  { text: "text-[#00FF94]", border: "border-[#00FF94]/50", shadow: "shadow-[#00FF94]/20", icon: Sparkles },
];

export function RecommendationsCardComponent({ card }: RecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithUrl[]>(
    card.recommendations.map(rec => ({ ...rec }))
  );

  useEffect(() => {
    async function fetchIgdbUrls() {
      const updated = await Promise.all(
        card.recommendations.map(async (rec) => {
          if (rec.igdbUrl) return rec;
          try {
            const res = await fetch('/api/igdb/game', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: rec.game }),
            });
            const data = await res.json();
            return { ...rec, igdbUrl: data.url ?? undefined };
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
        <h2 className="font-headline text-2xl md:text-3xl text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(255,46,80,0.5)] flex items-center justify-center gap-3">
          <Map className="w-8 h-8 text-[#FFE600]" />
          Discovery Queue
        </h2>
        <p className="text-gray-400 text-lg md:text-xl font-body">
          Curated adventures based on your playstyle.
        </p>
      </div>

      <div className="w-full max-w-lg group relative">
        {/* Shadow layer */}
        <div className="absolute -bottom-2 -right-2 h-full w-full bg-black/50 -z-10 pixel-corners translate-y-2" />

        <div className="relative bg-[#0F0F0F] border-4 border-[#2A2A2A] p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
          <div className="relative bg-[#111] border-2 border-[#222] p-6 md:p-8 flex flex-col items-center min-h-[400px] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 quest-pattern opacity-40 pointer-events-none" />

            {/* Large background icon */}
            <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none rotate-12">
              <Compass className="w-48 h-48 text-white" />
            </div>

            <div className="relative z-10 mb-6 w-full text-center">
              <span className="inline-block bg-[#00FF94] text-black font-headline text-[10px] md:text-xs px-3 py-1 uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                Recommended Next Games
              </span>
            </div>

            <div className="w-full flex flex-col gap-4 relative z-10 flex-grow justify-center">
              {recommendations.slice(0, 3).map((rec, index) => {
                const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
                const Icon = accent.icon;

                return (
                  <div
                    key={index}
                    className="group/item flex items-start gap-4 p-3 hover:bg-white/5 pixel-corners transition-colors cursor-default"
                  >
                    <div className={cn(
                      "flex-shrink-0 mt-1 bg-[#0F0F0F] border p-2 pixel-corners shadow-sm transition-transform group-hover/item:scale-110",
                      accent.border,
                      accent.shadow
                    )}>
                      <Icon className={cn("w-6 h-6", accent.text)} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        {rec.igdbUrl ? (
                          <a
                            href={rec.igdbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "font-headline text-xs md:text-sm mb-1 leading-relaxed hover:underline flex items-center gap-1 transition-colors",
                              accent.text
                            )}
                          >
                            {rec.game.toUpperCase()}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                          </a>
                        ) : (
                          <h3 className={cn(
                            "font-headline text-xs md:text-sm mb-1 leading-relaxed group-hover/item:text-white transition-colors",
                            accent.text
                          )}>
                            {rec.game.toUpperCase()}
                          </h3>
                        )}
                      </div>
                      <p className="font-body text-base md:text-lg text-gray-400 leading-tight line-clamp-2">
                        {rec.blurb}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-black text-[#444] py-2 px-4 text-center flex justify-between items-center group/btn border-t border-[#222]">
            <span className="font-headline text-[8px] uppercase tracking-widest group-hover/btn:text-gray-300 transition-colors">
              QUEST LOG 0{card.recommendations.length}
            </span>
            <span className="font-headline text-[8px] uppercase tracking-widest animate-pulse group-hover/btn:animate-none group-hover/btn:text-primary transition-colors">
              READY TO PLAY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
