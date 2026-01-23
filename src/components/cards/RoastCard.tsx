"use client";

import { RoastCard } from "@/types";
import { Flame, Share2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface RoastCardProps {
  card: RoastCard;
  isActive?: boolean;
}

const Typewriter = ({ text, delay = 0, isActive }: { text: string; delay?: number; isActive?: boolean }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isActive) {
      setDisplayedText("");
      return;
    }

    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [text, delay, isActive]);

  return <span>{displayedText}</span>;
};

export function RoastCardComponent({ card, isActive }: RoastCardProps) {
  return (
    <div className="h-[800px] w-full flex flex-col items-center gap-6 p-4 perspective-1000 overflow-hidden relative">
      {/* Background Static (Active Only) */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-noise-pattern pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className="text-center space-y-2 z-10">
        <h2 className="font-headline text-2xl md:text-3xl text-foreground uppercase tracking-widest drop-shadow-[4px_4px_0px_rgba(255,46,80,0.4)] flex items-center justify-center gap-3">
          The Friendly Joust
        </h2>
        <p className="text-muted-foreground text-lg md:text-xl font-body">
          We analyzed your data. <span className="text-primary font-bold">It was painful.</span>
        </p>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Main Roast Bubble */}
        <div className="group relative order-2 lg:order-1">
          <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
            <div className="relative bg-card/50 border-2 border-dashed border-border p-6 flex flex-col min-h-[300px] overflow-hidden">
              <div className="absolute inset-0 bg-noise-pattern opacity-30 pointer-events-none mix-blend-overlay" />
              <div className="relative z-20">
                <motion.div 
                   initial={{ scale: 0, opacity: 0 }}
                   animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                   transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                   className="bg-gray-100 dark:bg-zinc-950 border-4 border-foreground p-6 pixel-corners shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                 >
                  <p className="font-mono text-sm md:text-base lg:text-lg leading-relaxed text-emerald-700 dark:text-emerald-400">
                    <span className="opacity-50"># ROAST_INITIALIZED...</span><br/>
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ delay: 0.5 }}
                      className="inline-block bg-primary/20 text-primary px-2 py-0.5 mb-2 text-[10px] border border-primary/30"
                    >
                      LOG: {card.trigger.toUpperCase()}
                    </motion.span><br/>
                    <Typewriter text={card.roast} delay={1.2} isActive={isActive} />
                    {isActive && (
                      <motion.span 
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-4 bg-emerald-500 align-middle ml-1"
                      />
                    )}
                  </p>
                </motion.div>
                <div className="absolute -bottom-3 right-10 w-6 h-6 bg-background dark:bg-zinc-950 border-r-4 border-b-4 border-foreground transform rotate-45 z-10" />
              </div>

              <div className="relative z-20 flex items-end justify-end w-full mt-8">
                <div className="mr-4 mb-4 text-right">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 20 }}
                    transition={{ delay: 0.8 }}
                  >
                    <span className="font-glitch text-2xl md:text-4xl text-primary uppercase">Pathetic.</span>
                  </motion.div>
                  <span className="block font-headline text-[8px] text-primary uppercase font-bold">GAMING GOBLIN</span>
                </div>

                <motion.div 
                   initial={{ y: 50 }}
                   animate={{ y: isActive ? 0 : 50 }}
                   transition={{ type: "spring", delay: 0.5 }}
                   className="relative cursor-pointer hover:scale-110 transition-transform origin-bottom"
                 >
                   <div className="w-16 h-16 grid grid-cols-8 grid-rows-8 gap-0">
                     {/* Row 1 - Horns and top of head */}
                     <div className="col-start-2 row-start-1 col-span-1 bg-orange-700" />
                     <div className="col-start-3 row-start-1 col-span-4 bg-emerald-500" />
                     <div className="col-start-7 row-start-1 col-span-1 bg-orange-700" />
                     {/* Row 2 - Head wide */}
                     <div className="col-start-2 row-start-2 col-span-6 bg-emerald-500" />
                     {/* Row 3 - Eyes (spaced apart) */}
                     <div className="col-start-2 row-start-3 col-span-1 bg-emerald-500" />
                     <div className="col-start-3 row-start-3 col-span-1  bg-emerald-500 border border-black" />
                     <div className="col-start-4 row-start-3 col-span-2 bg-emerald-500" />
                     <div className="col-start-6 row-start-3 col-span-1  bg-emerald-500 border border-black" />
                     <div className="col-start-7 row-start-3 col-span-1 bg-emerald-500" />
                     {/* Row 4 - Mouth area */}
                     <div className="col-start-2 row-start-4 col-span-6 bg-emerald-500" />
                     {/* Row 5 - Body top */}
                     <div className="col-start-2 row-start-5 col-span-6 bg-emerald-600" />
                     {/* Row 6 - Body middle */}
                     <div className="col-start-2 row-start-6 col-span-2 bg-emerald-600" />
                     <div className="col-start-4 row-start-6 col-span-2 bg-black" />
                     <div className="col-start-6 row-start-6 col-span-2 bg-emerald-600" />
                     {/* Row 7 - Body bottom */}
                     <div className="col-start-2 row-start-7 col-span-6 bg-emerald-600" />
                     {/* Row 8 - Legs (spaced apart) */}
                     <div className="col-start-2 row-start-8 col-span-2 bg-emerald-700" />
                     <div className="col-start-6 row-start-8 col-span-2 bg-emerald-700 animate-bounce" />
                   </div>
                 </motion.div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-2 left-2 right-[-4px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-1 pixel-corners" />
        </div>

      </div>

      {/* Scrolling Warning Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-primary flex items-center overflow-hidden border-t-4 border-foreground z-20">
        <motion.div 
          animate={{ x: [0, -500] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="whitespace-nowrap font-headline text-[10px] text-white uppercase tracking-widest px-2"
        >
          SKILL ISSUE DETECTED // EMOTIONAL DAMAGE // TOUCH GRASS IMMEDIATELY // DATA UNFLATTERING // SKILL ISSUE DETECTED // EMOTIONAL DAMAGE
        </motion.div>
      </div>
    </div>
  );
}
