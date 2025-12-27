"use client";

import { PlayerPersonaCard as PlayerPersonaCardType } from "@/types";
import { Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PlayerPersonaCardProps {
  card: PlayerPersonaCardType;
}

const PERSONA_CONFIG: Record<string, { seed: string; tag: string }> = {
  "The Loyal Legend": { seed: "legend", tag: "LEGEND" },
  "The Platinum Plunderer": { seed: "trophy", tag: "PLUNDERER" },
  "The Squadron Leader": { seed: "commander", tag: "LEADER" },
  "The Narrative Navigator": { seed: "book", tag: "NARRATOR" },
  "The Apex Predator": { seed: "skull", tag: "PREDATOR" },
  "The Cozy Cultivator": { seed: "plant", tag: "CULTIVATOR" },
  "The Artisan Adventurer": { seed: "palette", tag: "ARTISAN" },
  "The Master Architect": { seed: "building", tag: "ARCHITECT" },
  "The High-Octane Hero": { seed: "power", tag: "HERO" },
  "The Vanguard Gamer": { seed: "future", tag: "VANGUARD" },
};

export default function PlayerPersonaCard({ card }: PlayerPersonaCardProps) {
  const config = PERSONA_CONFIG[card.persona] || { seed: 'gamer', tag: 'GAMER' };

  return (
    <div className="relative min-h-[400px] flex flex-col items-center justify-center p-4">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          {card.title}
        </h1>
      </div>

      <div className="w-full max-w-3xl group relative z-10">
        <div className="relative bg-card border-4 border-border p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 pixel-corners">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar Container */}
            <div className="flex flex-col items-center justify-center w-full md:w-fit md:float-left md:mr-8 md:mb-4 space-y-4 relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 relative pixel-corners bg-background flex items-center justify-center overflow-hidden border-4 border-border shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${config.seed}&backgroundColor=1a1a1a`}
                  alt={card.persona}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rendering-pixelated shadow-inner"
                  unoptimized
                />
                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 border-2 border-foreground transform rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {config.tag}
                </div>
              </div>
            </div>

            {/* Info Container */}
            <div className="relative z-10 text-center md:text-left flex-1">
              <div className="mb-4">
                <h2 className="font-headline text-xl md:text-2xl cursor-default text-foreground mb-2 uppercase leading-relaxed break-words text-primary">
                  {card.persona}
                </h2>
              </div>

              <div>
                <p className="font-body text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground italic">
                  &quot;{card.description}&quot;
                </p>
              </div>
              
              <div className="mt-6 flex gap-2 justify-center md:justify-start">
                 <Cpu className="w-5 h-5 text-muted-foreground" />
                 <Sparkles className="w-5 h-5 text-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}