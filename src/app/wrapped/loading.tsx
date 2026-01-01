"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BOOT_LINES = [
  "GW-BIOS(C) 2025 GAMING WRAPPED CORP.",
  "PROCESSOR: GEMINI-PRO MULTIMODAL V1.5",
  "MEMORY TEST: 65536KB OK",
  " ",
  "INITIALIZING NEURAL ANALYZER...",
  "LOADING PLAYTHROUGH DATABASE...",
  "SCANNING ACHIEVEMENTS...",
  "DECODING PLAYER SIGNATURE...",
  "DETECTING HARDWARE SIGNATURES...",
  " ",
  "KERNEL LOADED. STARTING EXPERIENCE...",
];

export default function Loading() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines(prev => {
        if (prev.length < BOOT_LINES.length) {
          return [...prev, BOOT_LINES[prev.length]];
        }
        return prev;
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-start justify-start min-h-screen p-8 bg-black font-mono text-emerald-500 uppercase tracking-tighter leading-tight relative overflow-hidden">
      {/* CRT Scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-50 crt-overlay opacity-20" />
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="scanline" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {visibleLines.map((line, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="min-h-[1.2rem]"
          >
            {line === " " ? "\u00A0" : line}
          </motion.div>
        ))}
        
        <motion.div 
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-3 h-5 bg-emerald-500 align-middle ml-1"
        />
      </div>

      <div className="absolute bottom-8 right-8 text-right opacity-50">
        <p className="text-[10px] font-headline">Revision 4.0.25</p>
        <p className="text-[10px] font-headline tracking-widest">LOADING STORY...</p>
      </div>
    </div>
  );
}
