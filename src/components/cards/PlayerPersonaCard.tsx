"use client";

import { PlayerPersonaCard as PlayerPersonaCardType } from "@/types";
import { Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";

interface PlayerPersonaCardProps {
  card: PlayerPersonaCardType;
  isActive?: boolean;
}

const PERSONA_CONFIG: Record<string, { seed: string; tag: string }> = {
  "The Loyal Legend": { seed: "Loyal Legend", tag: "LEGEND" },
  "The Platinum Plunderer": { seed: "Platinum Plunderer", tag: "PLUNDERER" },
  "The Squadron Leader": { seed: "Squadron Leader", tag: "LEADER" },
  "The Narrative Navigator": { seed: "Narrative Navigator", tag: "NARRATOR" },
  "The Apex Predator": { seed: "Apex Predator", tag: "PREDATOR" },
  "The Cozy Cultivator": { seed: "Cozy Cultivator", tag: "CULTIVATOR" },
  "The Artisan Adventurer": { seed: "lsjda", tag: "ARTISAN" },
  "The Master Architect": { seed: "jhsakdhjasduheu", tag: "ARCHITECT" },
  "The High-Octane Hero": { seed: "High-Octane Hero", tag: "HERO" },
  "The Vanguard Gamer": { seed: "Vanguard Gamer", tag: "VANGUARD" },
  "The Backlog Baron": { seed: "Backlog Baron", tag: "HOARDER" },
  "The Digital Hoarder": { seed: "Digital Hoarder", tag: "TOURIST" },
  "The Completionist Cultist": { seed: "Completionist Cultist", tag: "ZEALOT" },
  "The Early Access Enthusiast": { seed: "Early Access Enthusiast", tag: "PIONEER" },
  "The Diamond in the Rough Digger": { seed: "diamondint", tag: "TREASURE" },
  "The Speedrun Sorcerer": { seed: "Speedrun Specialist", tag: "OPTIMIZER" },
  "The Modded Maestro": { seed: "Community Coordinator", tag: "MECHANIC" },
  "The Digital Monogamist": { seed: "Master Architect", tag: "FAITHFUL" },
};

export default function PlayerPersonaCard({ card, isActive }: PlayerPersonaCardProps) {
  const config = PERSONA_CONFIG[card.persona] || { seed: 'gamer', tag: 'GAMER' };

  return (
    <div className="relative min-h-[400px] flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* Dynamic Background Aura */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: isActive ? 0.4 : 0, 
            scale: isActive ? [1, 1.2, 1] : 0.5,
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-[600px] h-[600px] rounded-full blur-[120px] bg-primary/20"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: isActive ? 0.3 : 0, 
            scale: isActive ? [1.2, 1, 1.2] : 0.5,
            rotate: [360, 270, 180, 90, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-[500px] h-[500px] rounded-full blur-[100px] bg-accent/20"
        />
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          {card.title}
        </h1>
      </div>

      <div className="w-full max-w-3xl group relative z-10">
        <div className="relative bg-card border-4 border-border p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 pixel-corners">
          
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar Container */}
            <motion.div 
              initial={{ scale: 0.8, rotate: -5, opacity: 0 }}
              animate={{ scale: isActive ? 1 : 0.8, rotate: isActive ? 0 : -5, opacity: isActive ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex flex-col items-center justify-center w-full md:w-fit md:float-left md:mr-8 md:mb-4 space-y-4 relative z-10"
            >
              <div className="relative">
                {/* Visual Aura Rings */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 border-2 border-primary/30 rounded-full blur-sm"
                />
                <motion.div 
                  animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-8 border border-accent/20 rounded-full blur-md"
                />

                <div className="w-32 h-32 md:w-40 md:h-40 relative pixel-corners bg-background flex items-center justify-center overflow-hidden border-4 border-border shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Image
                    src={`https://api.dicebear.com/9.x/bottts/svg?seed=${config.seed}&backgroundColor=1a1a1a`}
                    alt={card.persona}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover rendering-pixelated shadow-inner"
                    unoptimized
                  />
                  <div className="absolute -bottom-2 -right-4 bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 border-2 border-foreground transform rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap z-20">
                    {config.tag}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Info Container */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative z-10 text-center md:text-left flex-1"
            >
              <div className="mb-4">
                <span className="text-[10px] font-headline text-muted-foreground uppercase tracking-[0.3em] mb-2 block">Identity Confirmed</span>
                <h2 className="font-headline text-xl md:text-2xl cursor-default text-foreground mb-2 uppercase leading-relaxed break-words text-primary">
                  {card.persona}
                </h2>
              </div>

              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 hidden md:block" />
                <p className="font-body text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground italic pl-0 md:pl-4">
                  &quot;{card.description}&quot;
                </p>
              </div>
              
              <div className="mt-8 flex gap-4 justify-center md:justify-start items-center border-t border-border pt-6">
                 <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 pixel-corners border border-border">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-[8px] font-headline">PROCESSOR_STABLE</span>
                 </div>
                 <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 pixel-corners border border-border">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-[8px] font-headline">AURA_SYNCED</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}