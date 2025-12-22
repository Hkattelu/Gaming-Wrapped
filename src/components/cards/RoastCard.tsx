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
        <h2 className="font-headline text-2xl md:text-3xl text-white uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(255,46,80,0.8)] flex items-center justify-center gap-3">
          <Flame className="w-8 h-8 text-primary animate-bounce" />
          {card.title.toUpperCase()}
        </h2>
        <p className="text-gray-400 text-lg md:text-xl font-body">
          We analyzed your data. <span className="text-primary font-bold">We have concerns.</span>
        </p>
      </div>

      <div className="w-full max-w-lg group relative">
        {/* Shadow layer */}
        <div className="absolute -bottom-2 -right-2 h-full w-full bg-black/50 -z-10 pixel-corners translate-y-2" />

        <div className="relative bg-[#0F0F0F] border-4 border-[#2A2A2A] p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
          <div className="relative bg-[#111] border-2 border-dashed border-[#333] p-6 flex flex-col min-h-[400px] overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-noise-pattern opacity-30 pointer-events-none mix-blend-overlay" />

            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-20 h-20 border-2 border-[#00F0FF] opacity-10 rotate-45 pointer-events-none" />
            <div className="absolute bottom-20 left-4 w-4 h-4 bg-primary opacity-30 pointer-events-none" />

            <div className="relative z-20 mb-auto">
              <div className="bg-[#1a1a1a] border-4 border-white p-6 pixel-corners shadow-[4px_4px_0px_rgba(255,255,255,0.1)] relative">
                <p className="font-headline text-[10px] md:text-xs leading-loose text-gray-200">
                  {card.roast}
                </p>
                <div className="mt-6 text-center transform -rotate-2">
                  <span className="font-glitch text-3xl md:text-5xl text-primary glitch-text-shadow bg-black/50 px-2 uppercase">
                    Pathetic.
                  </span>
                </div>
                {/* Speech bubble tail */}
                <div className="absolute -bottom-4 right-12 w-6 h-6 bg-[#1a1a1a] border-r-4 border-b-4 border-white transform rotate-45 z-30" />
              </div>
            </div>

            <div className="relative z-20 mt-4 flex items-end justify-end w-full">
              <div className="mr-4 mb-2 text-right">
                <span className="block font-headline text-[8px] text-gray-500 uppercase tracking-widest">Your Agent</span>
                <span className="block font-headline text-[10px] text-primary uppercase">GLITCH_GOBLIN_v2</span>
              </div>

              {/* Pixel Character (Glitch Goblin) */}
              <div className="relative group/goblin cursor-pointer hover:scale-110 transition-transform origin-bottom">
                <div className="w-16 h-16 md:w-20 md:h-20 grid grid-cols-8 grid-rows-8 gap-0">
                  {/* Row 1-2: Ears */}
                  <div className="col-start-3 col-span-1 bg-[#00FF94]" />
                  <div className="col-start-6 col-span-1 bg-[#00FF94]" />
                  <div className="col-start-2 col-span-1 bg-[#00FF94]" />
                  <div className="col-start-3 col-span-1 bg-[#00FF94]" />
                  <div className="col-start-6 col-span-1 bg-[#00FF94]" />
                  <div className="col-start-7 col-span-1 bg-[#00FF94]" />
                  {/* Row 3: Head Top */}
                  <div className="col-start-2 col-span-6 bg-[#00FF94]" />
                  {/* Row 4: Eyes */}
                  <div className="col-start-1 col-span-8 bg-[#00FF94] flex items-center justify-around px-2">
                    <div className="w-2 h-2 bg-white pixel-corners animate-pulse" />
                    <div className="w-2 h-2 bg-white pixel-corners animate-pulse" />
                  </div>
                  {/* Row 5: Mouth */}
                  <div className="col-start-1 col-span-8 bg-[#00FF94] flex justify-center">
                    <div className="w-4 h-1 bg-black mt-1" />
                  </div>
                  {/* Row 6-8: Body */}
                  <div className="col-start-1 col-span-8 bg-[#00FF94] opacity-80" />
                  <div className="col-start-2 col-span-6 bg-[#00FF94]" />
                  <div className="col-start-3 col-span-4 bg-[#00FF94]" />
                </div>
              </div>
            </div>

            {/* Warning Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#FFE600] flex items-center overflow-hidden border-t-4 border-black">
              <div className="whitespace-nowrap font-headline text-[10px] text-black uppercase tracking-widest px-2 animate-pulse whitespace-nowrap">
                Warning: Skill Issue Detected // Warning: Skill Issue Detected // Warning: Skill Issue Detected // Warning: Skill Issue Detected
              </div>
            </div>
          </div>

          <div className="bg-black text-[#444] py-3 px-4 text-center flex items-center justify-center gap-2 group/btn border-t border-[#222] hover:bg-primary/10 transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="font-headline text-[10px] uppercase tracking-widest group-hover/btn:text-primary transition-colors">
              Share The Shame
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
