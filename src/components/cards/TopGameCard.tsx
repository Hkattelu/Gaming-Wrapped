'use client';

import { TopGameCard as TopGameCardType } from '@/types';
import { Gamepad2, Monitor, ArrowLeft, ArrowRight } from 'lucide-react';

export function TopGameCard({ card }: { card: TopGameCardType }) {
  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
           style={{
             backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-12 relative z-10">
        <h1 className="font-headline text-2xl md:text-4xl uppercase tracking-widest"
            style={{
              textShadow: '2px 2px 0px hsl(var(--primary) / 0.5)'
            }}>
          <Gamepad2 className="inline-block w-8 h-8 md:w-10 md:h-10 text-primary mr-2 mb-1" />
          Your Top Pick
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-md group relative z-10">
        {/* Card with pixel corners effect */}
        <div className="relative bg-card border-4 border-border p-1 shadow-2xl transition-transform hover:-translate-y-2 duration-300"
             style={{
               clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
             }}>
          
          {/* Inner card content */}
          <div className="relative bg-card/50 border-2 border-border/50 p-6 flex flex-col items-center text-center overflow-hidden">
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Gamepad2 className="w-32 h-32 text-primary rotate-12" />
            </div>

            {/* Top badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-block bg-accent text-accent-foreground font-headline text-xs px-2 py-1 uppercase tracking-widest border-2 border-foreground"
                    style={{
                      boxShadow: '2px 2px 0px hsl(var(--foreground))'
                    }}>
                #1 in {new Date().getFullYear()}
              </span>
            </div>

            {/* Game Image/Icon Container */}
            <div className="w-48 h-48 mb-6 relative mt-8">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full"></div>
              
              {/* Image frame */}
              <div className="relative w-full h-full bg-muted border-4 border-foreground overflow-hidden"
                   style={{
                     boxShadow: '4px 4px 0px hsl(var(--primary))',
                     clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
                   }}>
                {/* Placeholder for game image - can be replaced with actual image */}
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center hover:scale-110 transition-transform duration-500">
                  <Gamepad2 className="w-24 h-24 text-foreground/80" />
                </div>
                
                {/* Scanlines effect */}
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                     style={{
                       background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1))',
                       backgroundSize: '100% 4px'
                     }}>
                </div>
              </div>
            </div>

            {/* Game Title */}
            <h2 className="font-headline text-2xl md:text-3xl uppercase leading-tight mb-2 tracking-wide"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
              {card.game.title}
            </h2>

            {/* Platform and Genre */}
            <div className="flex items-center gap-3 text-lg md:text-xl text-muted-foreground font-bold mb-6 font-body">
              <span className="flex items-center gap-1">
                <Monitor className="w-4 h-4" />
                {card.game.platform}
              </span>
              {card.game.genres && card.game.genres.length > 0 && (
                <>
                  <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                  <span>{card.game.genres.slice(0, 2).join(' / ')}</span>
                </>
              )}
            </div>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 gap-4 border-t-2 border-dashed border-border pt-6 mt-2">
              {/* Score */}
              {typeof card.game.score === 'number' && (
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-lg uppercase font-body">Your Score</span>
                  <div className="text-primary font-headline text-2xl md:text-3xl mt-1"
                       style={{
                         textShadow: '2px 2px 0px rgba(255,255,255,0.1)'
                       }}>
                    {card.game.score}<span className="text-sm align-top opacity-70">/10</span>
                  </div>
                </div>
              )}
              
              {/* Hours Played */}
              {card.game.hoursPlayed && (
                <div className={`flex flex-col items-center ${typeof card.game.score === 'number' ? 'border-l-2 border-dashed border-border' : ''}`}>
                  <span className="text-muted-foreground text-lg uppercase font-body">Hours</span>
                  <div className="font-headline text-xl md:text-2xl mt-2">
                    {card.game.hoursPlayed}<span className="text-sm font-body text-muted-foreground ml-1">hrs</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <div className="bg-foreground text-background py-3 px-4 text-center cursor-pointer hover:bg-primary transition-colors duration-200">
            <span className="font-headline text-xs uppercase tracking-widest animate-pulse">Share This Card</span>
          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-black/20 dark:bg-black/50 -z-10 transform translate-y-2"
             style={{
               clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
             }}>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8 relative z-10">
        <button className="bg-transparent border-2 border-foreground/60 hover:bg-muted px-6 py-2 font-headline text-xs uppercase transition-all"
                style={{
                  clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))'
                }}>
          <ArrowLeft className="inline-block w-3 h-3 mr-2 mb-0.5" /> Prev
        </button>
        <button className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90 px-6 py-2 font-headline text-xs uppercase transition-all active:translate-y-1"
                style={{
                  clipPath: 'polygon(0px 4px, 4px 4px, 4px 0px, calc(100% - 4px) 0px, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0px calc(100% - 4px))',
                  boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
                }}>
          Next Game <ArrowRight className="inline-block w-3 h-3 ml-2 mb-0.5" />
        </button>
      </div>
    </div>
  );
}
