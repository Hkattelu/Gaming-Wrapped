"use client";

import { PlayerPersonaCard } from "@/types";
import { User, Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerPersonaCardProps {
  card: PlayerPersonaCard;
}

export function PlayerPersonaCardComponent({ card }: PlayerPersonaCardProps) {
  // Generate a seed for DiceBear based on the persona name
  const avatarSeed = card.persona.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className="h-[550px] w-full flex flex-col items-center gap-6 p-4 perspective-1000">
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(255,46,80,0.3)] animate-pulse">
          YOUR PERSONA
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-body">
          Detailed behavior analysis complete.
        </p>
      </div>

      <div className="w-full max-w-lg group relative">
        {/* Shadow layer */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-600 to-primary rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

        <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-2xl transition-transform transform group-hover:-translate-y-1 duration-300">
          {/* Diagnostic corners */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-primary -translate-x-1 -translate-y-1" />
          <div className="absolute top-0 right-0 w-4 h-4 bg-primary translate-x-1 -translate-y-1" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-primary -translate-x-1 translate-y-1" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary translate-x-1 translate-y-1" />

          <div className="relative bg-card/50 border-2 border-dashed border-border p-6 md:p-8 flex flex-col items-center md:flex-row gap-8 overflow-hidden min-h-[380px]">
            {/* CRT Overlay Effects */}
            <div className="absolute inset-0 z-50 pointer-events-none crt-overlay mix-blend-overlay opacity-20" />
            <div className="scanline pointer-events-none absolute inset-0" />

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            {/* Left Column: Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-full md:w-1/3 space-y-4 relative z-10">
              <div className="w-40 h-40 md:w-44 md:h-44 relative pixel-corners bg-background flex items-center justify-center overflow-hidden border-4 border-border shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}&backgroundColor=1a1a1a`}
                  alt={card.persona}
                  className="w-full h-full object-cover rendering-pixelated shadow-inner"
                />
                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 border-2 border-foreground transform rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  S-RANK
                </div>
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="flex-grow flex flex-col justify-center space-y-4 relative z-10 text-center md:text-left">
              <div>
                <h3 className="font-headline text-[10px] text-primary mb-2 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                  <Cpu className="w-3 h-3" />
                  Classification
                </h3>
                <h2 className="font-headline text-xl md:text-2xl lg:text-3xl leading-tight glitch-text cursor-default text-foreground mb-2 uppercase tracking-tighter">
                  {card.persona}
                </h2>
                <div className="h-1 w-16 bg-primary mx-auto md:mx-0" />
              </div>

              <p className="font-body text-xl md:text-2xl leading-relaxed text-muted-foreground">
                {card.description}
              </p>

              <div className="pt-2 flex justify-center md:justify-start">
                <div className="flex items-center gap-2 text-accent font-headline text-[8px] uppercase tracking-widest font-bold">
                  <Sparkles className="w-3 h-3" />
                  Elite Profile Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
