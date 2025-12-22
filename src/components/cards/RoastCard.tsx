"use client";

import { RoastCard } from "@/types";
import { Flame, Share2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoastCardProps {
  card: RoastCard;
}

export function RoastCardComponent({ card }: RoastCardProps) {
  return (
    <div className="h-[550px] w-full flex flex-col items-center gap-6 p-4 perspective-1000">
      <div className="text-center space-y-2">
        <h2 className="font-headline text-2xl md:text-3xl text-foreground uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(255,46,80,0.4)] flex items-center justify-center gap-3">
          <Flame className="w-8 h-8 text-primary animate-bounce" />
          {card.title.toUpperCase()}
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-body">
          We analyzed your data. <span className="text-primary font-bold">We have concerns.</span>
        </p>
      </div>

      <div className="w-full max-w-lg group relative">
        {/* Shadow layer */}
        <div className="absolute -bottom-2 -right-2 h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 pixel-corners translate-y-2" />

        <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
          <div className="relative bg-card/50 border-2 border-dashed border-border p-6 flex flex-col min-h-[400px] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-noise-pattern opacity-30 pointer-events-none mix-blend-overlay" />

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 border-2 border-cyan-500/20 opacity-10 rotate-45 pointer-events-none" />
            <div className="absolute bottom-20 left-4 w-4 h-4 bg-primary opacity-30 pointer-events-none" />

            <div className="relative z-20 mb-auto">
              <div className="bg-card border-4 border-foreground p-6 pixel-corners shadow-[4px_4px_0px_rgba(0,0,0,0.1)] relative">
                <p className="font-headline text-[10px] md:text-xs leading-loose text-card-foreground">
                  {card.roast}
                </p>
                <div className="mt-6 text-center transform -rotate-2">
                  <span className="font-glitch text-3xl md:text-5xl text-primary glitch-text-shadow bg-foreground/5 px-2 uppercase">
                    Pathetic.
                  </span>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-4 right-12 w-6 h-6 bg-card border-r-4 border-b-4 border-foreground transform rotate-45 z-30" />
              </div>
            </div>

            <div className="relative z-20 mt-4 flex items-end justify-end w-full">
              <div className="mr-4 mb-2 text-right">
                <span className="block font-headline text-[8px] text-muted-foreground uppercase tracking-widest">Your Agent</span>
                <span className="block font-headline text-[10px] text-primary uppercase font-bold">GLITCH_GOBLIN_v2</span>
              </div>

              {/* Pixel Character (Glitch Goblin) */}
              <div className="relative group/goblin cursor-pointer hover:scale-110 transition-transform origin-bottom">
                <div className="w-16 h-16 md:w-20 md:h-20 grid grid-cols-8 grid-rows-8 gap-0">
                  {/* Row 1-2: Ears */}
                  <div className="col-start-3 col-span-1 bg-emerald-500" />
                  <div className="col-start-6 col-span-1 bg-emerald-500" />
                  <div className="col-start-2 col-span-1 bg-emerald-500" />
                  <div className="col-start-3 col-span-1 bg-emerald-500" />
                  <div className="col-start-6 col-span-1 bg-emerald-500" />
                  <div className="col-start-7 col-span-1 bg-emerald-500" />
                  {/* Row 3: Head Top */}
                  <div className="col-start-2 col-span-6 bg-emerald-500" />
                  {/* Row 4: Eyes */}
                  <div className="col-start-1 col-span-8 bg-emerald-500 flex items-center justify-around px-2">
                    <div className="w-2 h-2 bg-white pixel-corners animate-pulse" />
                    <div className="w-2 h-2 bg-white pixel-corners animate-pulse" />
                  </div>
                  {/* Row 5: Mouth */}
                  <div className="col-start-1 col-span-8 bg-emerald-500 flex justify-center">
                    <div className="w-4 h-1 bg-black mt-1" />
                  </div>
                  {/* Row 6-8: Body */}
                  <div className="col-start-1 col-span-8 bg-emerald-500 opacity-80" />
                  <div className="col-start-2 col-span-6 bg-emerald-500" />
                  <div className="col-start-3 col-span-4 bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Warning Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-accent flex items-center overflow-hidden border-t-4 border-foreground">
              <div className="whitespace-nowrap font-headline text-[10px] text-accent-foreground uppercase tracking-widest px-2 animate-pulse whitespace-nowrap">
                Warning: Skill Issue Detected // Warning: Skill Issue Detected // Warning: Skill Issue Detected // Warning: Skill Issue Detected
              </div>
            </div>
          </div>

          <div className="bg-secondary text-muted-foreground py-3 px-4 text-center flex items-center justify-center gap-2 group/btn border-t border-border hover:bg-primary/10 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="font-headline text-[10px] uppercase tracking-widest group-hover/btn:text-foreground transition-colors">
              Share The Shame
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
