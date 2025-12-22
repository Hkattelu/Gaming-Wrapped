"use client";

import { PlayerPersonaCard } from "@/types";
import { Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerPersonaCardProps {
  card: PlayerPersonaCard;
}

const PERSONA_CONFIG: Record<string, { seed: string; color: string; tag: string }> = {
  "The Loyal Legend": { seed: "legend", color: "from-yellow-400 to-orange-500", tag: "LR" },
  "The Platinum Plunderer": { seed: "trophy", color: "from-blue-400 to-indigo-600", tag: "PR" },
  "The Squadron Leader": { seed: "commander", color: "from-green-400 to-emerald-600", tag: "SL" },
  "The Narrative Navigator": { seed: "book", color: "from-purple-400 to-pink-600", tag: "NN" },
  "The Apex Predator": { seed: "skull", color: "from-red-500 to-rose-700", tag: "AX" },
  "The Cozy Cultivator": { seed: "plant", color: "from-emerald-300 to-teal-500", tag: "CC" },
  "The Artisan Adventurer": { seed: "palette", color: "from-orange-300 to-amber-500", tag: "AA" },
  "The Master Architect": { seed: "building", color: "from-cyan-400 to-blue-500", tag: "MA" },
  "The High-Octane Hero": { seed: "power", color: "from-orange-500 to-red-600", tag: "HO" },
  "The Vanguard Gamer": { seed: "future", color: "from-indigo-400 to-violet-600", tag: "VG" },
};

export function PlayerPersonaCardComponent({ card }: PlayerPersonaCardProps) {
  const config = PERSONA_CONFIG[card.persona] || { seed: "gamer", color: "from-primary to-purple-600", tag: "S" };

  return (
    <div className="min-h-[550px] w-full flex flex-col items-center gap-6 p-4 perspective-1000">
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(255,46,80,0.3)]">
          YOUR PERSONA
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-body">
          Detailed behavior analysis complete.
        </p>
      </div>

      <div className="w-full max-w-lg group relative">
        {/* Shadow layer */}
        <div className={cn("absolute -inset-1 bg-gradient-to-r rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200", config.color)} />

        <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-2xl transition-transform transform group-hover:-translate-y-1 duration-300">
          <div className="relative bg-card/50 border-2 border-dashed border-border p-6 md:p-8 flex flex-col items-center md:flex-row gap-8 overflow-hidden min-h-[400px]">
            {/* CRT Overlay Effects */}
            <div className="absolute inset-0 z-50 pointer-events-none crt-overlay mix-blend-overlay opacity-20" />
            <div className="scanline pointer-events-none absolute inset-0" />

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            {/* Left Column: Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-1/3 space-y-4 relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 relative pixel-corners bg-background flex items-center justify-center overflow-hidden border-4 border-border shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${config.seed}&backgroundColor=1a1a1a`}
                  alt={card.persona}
                  className="w-full h-full object-cover rendering-pixelated shadow-inner"
                />
                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 border-2 border-foreground transform rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {config.tag}-RANK
                </div>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="flex-grow flex flex-col justify-center w-full space-y-3 relative z-10 text-center md:text-left min-w-0">
              <div>
                <h2 className="font-headline text-xl md:text-2xl cursor-default text-foreground mb-2 uppercase leading-relaxed break-words">
                  {card.persona}
                </h2>
                <div className="h-1 w-16 bg-primary mx-auto md:mx-0" />
              </div>

              <div className="max-h-[180px] overflow-y-auto no-scrollbar">
                <p className="font-body text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground italic">
                  &quot;{card.description}&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
