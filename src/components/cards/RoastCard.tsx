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
          <Flame className="w-8 h-8 text-primary" />
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

            <div className="relative z-20">
              <div className="relative">
                <div className="bg-card border-4 border-foreground p-6 pixel-corners shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
                  <p className="font-headline text-[10px] md:text-xs leading-loose text-card-foreground">
                    {card.roast}
                  </p>
                </div>
                {/* Speech bubble tail: outside the clipped pixel-corners div */}
                <div className="absolute -bottom-3 right-10 w-6 h-6 bg-card border-r-4 border-b-4 border-foreground transform rotate-45 z-10" />
              </div>
            </div>

            <div className="relative z-20 flex items-end justify-end w-full">
              <div className="mr-4 mb-4 text-right">
                <div className="mt-6 text-center transform -rotate-2 mb-4">
                  <span className="font-glitch text-3xl md:text-5xl text-primary glitch-text-shadow bg-foreground/5 px-2 uppercase">
                    Pathetic.
                  </span>
                </div>
                <span className="block font-headline text-[10px] text-primary uppercase font-bold">GLITCH GOBLIN</span>
              </div>

              {/* Pixel Character (Glitch Goblin) */}
              <div className="relative group/goblin cursor-pointer hover:scale-110 transition-transform origin-bottom">
                <div className="w-16 h-16 md:w-20 md:h-20 grid grid-cols-8 grid-rows-8 gap-0">
                  {/* Row 1: Ears */}
                  <div className="col-start-1 col-span-1 bg-emerald-600" />
                  <div className="col-start-8 col-span-1 bg-emerald-600" />

                  {/* Row 2: Ears/Head Top */}
                  <div className="col-start-1 col-span-1 bg-emerald-600" />
                  <div className="col-start-3 col-span-4 bg-emerald-500" />
                  <div className="col-start-8 col-span-1 bg-emerald-600" />

                  {/* Row 3: Head */}
                  <div className="col-start-2 col-span-6 bg-emerald-500" />

                  {/* Row 4: Eyes */}
                  <div className="col-start-2 col-span-6 bg-emerald-500 flex items-center justify-around px-1">
                    <div className="w-3 h-3 bg-white border-2 border-black pixel-corners shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    <div className="w-3 h-3 bg-white border-2 border-black pixel-corners shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                  </div>

                  {/* Row 5: Nose/Face */}
                  <div className="col-start-2 col-span-6 bg-emerald-500 flex justify-center">
                    <div className="w-2 h-2 bg-emerald-700 mt-1" />
                  </div>

                  {/* Row 6: Mouth */}
                  <div className="col-start-1 col-span-8 bg-emerald-500 flex justify-center">
                    <div className="w-6 h-2 bg-black mt-1" />
                  </div>

                  {/* Row 7-8: Body */}
                  <div className="col-start-2 col-span-6 bg-emerald-600" />
                  <div className="col-start-3 col-span-4 bg-emerald-700" />
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
        </div>
      </div>
    </div>
  );
}
