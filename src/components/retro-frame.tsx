"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RetroFrameProps {
  children: React.ReactNode;
  className?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onStart?: () => void;
  onSelect?: () => void;
  onCoin?: () => void;
  onToggleMute?: () => void;
  onToggleAutoPlay?: () => void;
  statusText?: string;
}

export function RetroFrame({ 
  children, 
  className, 
  onPrev, 
  onNext, 
  onStart, 
  onSelect,
  onCoin,
  onToggleMute,
  onToggleAutoPlay,
  statusText = "SYSTEM STABLE // OPTIMIZING PIXELS // LOADING STORY" 
}: RetroFrameProps) {
  return (
    <div className={cn("relative group", className)}>
      {/* Outer Case */}
      <div className="absolute -inset-4 bg-[#27272a] border-b-8 border-r-8 border-black rounded-xl hidden lg:block shadow-2xl" />
      
      {/* Screen Inset */}
      <div className="relative bg-black rounded-lg p-1 lg:p-4 border-4 border-[#3f3f46] shadow-inner overflow-hidden">
        {/* Decorative Screws */}
        <div className="hidden lg:block absolute top-2 left-2 w-3 h-3 bg-[#52525b] rounded-full border-b-2 border-black" />
        <div className="hidden lg:block absolute top-2 right-2 w-3 h-3 bg-[#52525b] rounded-full border-b-2 border-black" />
        <div className="hidden lg:block absolute bottom-2 left-2 w-3 h-3 bg-[#52525b] rounded-full border-b-2 border-black" />
        <div className="hidden lg:block absolute bottom-2 right-2 w-3 h-3 bg-[#52525b] rounded-full border-b-2 border-black" />

        {/* Power LED */}
        <div className="hidden lg:flex absolute top-4 right-12 items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]" />
        </div>

        {/* The Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>

      {/* Side "Arcade" Decorations (Wide Desktop Only) */}
      <div className="hidden xl:block absolute top-1/2 -left-16 -translate-y-1/2 w-16 h-64 bg-[#18181b] border-2 border-[#3f3f46] rounded-l-2xl shadow-xl">
        <div className="flex flex-col h-full items-center justify-around py-8 gap-3">
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={onPrev}
              className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all hover:bg-red-500 shadow-lg" 
              title="Previous Slide"
            >
              <div className="w-2 h-6 bg-black/20 rounded-full group-active/btn:bg-black/40" />
            </button>
            <span className="text-sm text-muted-foreground uppercase">Back</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={onToggleMute}
              className="w-10 h-10 bg-blue-600 rounded-full border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all hover:bg-blue-500 shadow-lg" 
              title="Toggle Audio"
            />
            <span className="text-sm text-muted-foreground uppercase">Mute</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button 
              onClick={onToggleAutoPlay}
              className="w-10 h-10 bg-yellow-600 rounded-full border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all hover:bg-yellow-500 shadow-lg" 
              title="Toggle Auto-Play"
            />
            <span className="text-sm text-muted-foreground uppercase">Auto</span>
          </div>
        </div>
      </div>
      <div className="hidden xl:block absolute top-1/2 -right-16 -translate-y-1/2 w-16 h-64 bg-[#18181b] border-2 border-[#3f3f46] rounded-r-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col h-full items-center justify-start py-4 gap-4">
          <button 
            onClick={onNext}
            className="w-12 h-12 bg-emerald-600 rounded-full border-b-4 border-black active:border-b-0 active:translate-y-1 transition-all hover:bg-emerald-500 shadow-xl flex items-center justify-center group/btn"
            title="Next Slide"
          >
            <div className="w-2 h-6 bg-black/20 rounded-full group-active/btn:bg-black/40" />
          </button>
          
          <div>
            <span className="text-sm">NEXT</span>
          </div>

          <div className="mt-auto flex flex-col gap-2 pb-4">
            <div className="w-8 h-1 bg-[#3f3f46] rounded-full" />
            <div className="w-8 h-1 bg-[#3f3f46] rounded-full" />
          </div>
        </div>
      </div>

      {/* Decorative Branding on the Case */}
      <div className="flex absolute -bottom-12 left-1/2 -translate-x-1/2 w-[400px] h-10 bg-[#18181b] border-2 border-[#3f3f46] rounded-b-xl flex items-center justify-around px-4">
        <div className="flex flex-col items-center gap-1">
          <div 
            onClick={onSelect}
            className="w-8 h-3 bg-[#3f3f46] rounded-sm border-b-2 border-black active:border-b-0 active:translate-y-0.5 cursor-pointer hover:bg-[#52525b]" 
          />
          <span className="text-[6px] font-headline text-[#71717a]">SELECT</span>
        </div>
        
        {/* Coin Slot */}
        <div 
          onClick={onCoin}
          className="flex items-center justify-center gap-2 px-4 border-x border-[#3f3f46] cursor-coin group/coin hover:bg-yellow-500/5 transition-colors"
        >
           <div className="w-4 h-6 bg-black rounded-sm border-2 border-[#3f3f46] flex flex-col items-center justify-center gap-1 group-hover/coin:border-yellow-600 transition-colors">
              <div className="w-0.5 h-3 bg-yellow-600/50 rounded-full group-hover/coin:bg-yellow-500" />
           </div>
           <span className="text-[6px] font-headline text-yellow-600/50 group-hover/coin:text-yellow-500">INSERT COIN</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div 
            onClick={onStart}
            className="w-8 h-3 bg-[#3f3f46] rounded-sm border-b-2 border-black active:border-b-0 active:translate-y-0.5 cursor-pointer hover:bg-[#52525b]" 
          />
          <span className="text-[6px] font-headline text-[#71717a]">START</span>
        </div>
      </div>
    </div>
  );
}
