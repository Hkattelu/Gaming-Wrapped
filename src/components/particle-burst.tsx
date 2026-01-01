"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export function ParticleBurst({ active, isGold }: { active: boolean; isGold?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const standardColors = ["#ff0055", "#00ffcc", "#fbbf24", "#8b5cf6", "#3b82f6"];
      const goldColors = ["#fbbf24", "#f59e0b", "#d97706", "#fcd34d", "#ffffff"];
      const colors = isGold ? goldColors : standardColors;
      
      const newParticles = [...Array(isGold ? 50 : 30)].map((_, i) => ({
        id: Date.now() + i,
        x: 0,
        y: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * (isGold ? 12 : 8) + 4,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [active, isGold]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[110] flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 600 - 100,
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute pixel-corners"
          style={{ 
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            boxShadow: `0 0 10px ${p.color}`
          }}
        />
      ))}
    </div>
  );
}
