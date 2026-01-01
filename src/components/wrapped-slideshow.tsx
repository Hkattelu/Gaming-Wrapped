'use client';

import { WrappedData, WrappedCard } from "@/types";
import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Logo } from "./logo";
import { Gift, Share2, Sparkles, Gamepad2, ArrowRight, Heart, Volume2, VolumeX, Monitor, Music, Music2, Loader2, Trophy, Twitter, Play, Pause } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { PlatformStatsCard } from './cards/PlatformStatsCard';
import { TopGameCard } from './cards/TopGameCard';
import { SummaryCard } from './cards/SummaryCard';

import { GenreBreakdownCard } from './cards/GenreBreakdownCard';

import { ScoreDistributionCard } from './cards/ScoreDistributionCard';
import PlayerPersonaCardComponent from "./cards/PlayerPersonaCard";

import { RoastCardComponent } from "./cards/RoastCard";
import { RecommendationsCardComponent } from "./cards/RecommendationsCard";
import { motion, AnimatePresence } from "framer-motion";
import { RetroFrame } from "./retro-frame";
import { useRef, useCallback } from "react";
import { ParticleBurst } from "./particle-burst";
import { TiltCard } from "./tilt-card";

export function WrappedSlideshow({ data, id, isGenerating = false }: { data: WrappedData, id: string | null, isGenerating?: boolean }) {
  const { toast } = useToast();
  const { cards } = data;
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isPoweringUp, setIsPoweringUp] = useState(false);
  const [isFlickering, setIsFlickering] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [showCrt, setShowCrt] = useState(true);
  const [floatingPixels, setFloatingPixels] = useState<Array<{ x: string; y: string; duration: number }>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 8000; // 8 seconds per slide

  // Initialize floating pixels on client only
  useEffect(() => {
    setFloatingPixels(
      [...Array(6)].map(() => ({
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        duration: 5 + Math.random() * 5,
      }))
    );
  }, []);

  // Sound effects logic
  const playSound = (type: 'nav' | 'success' | 'startup' | 'glitch' | 'achievement' | 'coin' | 'rankup') => {
    if (isMuted) return;
    try {
      const sounds = {
        nav: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', // Retro click
        success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Win/Success
        startup: 'https://assets.mixkit.co/active_storage/sfx/2578/2571-preview.mp3', // Power up
        glitch: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Glitch
        achievement: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Bell
        coin: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Coin
        rankup: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3', // Level up
      };
      const audio = new Audio(sounds[type]);
      audio.volume = 0.15;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleCoin = () => {
    playSound('coin');
  };

  // Auto-play logic
  const handleNext = useCallback(() => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    } else {
      setIsAutoPlaying(false);
    }
  }, [api]);

  // Status message for RetroFrame ticker
  const summaryCard = cards.find(c => c.type === 'summary') as any;
  const platformCard = cards.find(c => c.type === 'platform_stats') as any;
  const topGameCard = cards.find(c => c.type === 'top_game') as any;
  const personaCard = cards.find(c => c.type === 'player_persona') as any;

  useEffect(() => {
    if (isAutoPlaying) {
      setSlideProgress(0);
      const interval = 100;
      const step = (interval / SLIDE_DURATION) * 100;
      
      const timer = setInterval(() => {
        setSlideProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + step;
        });
      }, interval);

      return () => clearInterval(timer);
    } else {
      setSlideProgress(0);
    }
  }, [isAutoPlaying, current, handleNext]);

  const handleTwitterShare = () => {
    const shareUrl = `${window.location.origin}/wrapped?id=${id}`;
    const text = `Check out my Gaming Wrapped 2025! My persona is ${personaCard?.persona || 'Gamer'}. 🎮`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleInstagramShare = () => {
    toast({
      title: "POST TO STORIES",
      description: "Download the STORY version below and upload it to your Instagram Stories!",
    });
  };

  const handleStartWrapped = () => {
    setIsPoweringUp(true);
    playSound('startup');
    setTimeout(() => {
      api?.scrollNext();
      setIsPoweringUp(false);
    }, 800);
  };

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3'); // Placeholder retro loop
      audioRef.current.loop = true;
      audioRef.current.volume = 0.1;
    }

    if (isMusicPlaying && !isMuted) {
      audioRef.current.play().catch(() => setIsMusicPlaying(false));
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [isMusicPlaying, isMuted]);

  useEffect(() => {
    if (current > 0) {
      playSound('nav');
      setIsFlickering(true);
      const timer = setTimeout(() => setIsFlickering(false), 150);
      return () => clearTimeout(timer);
    }
    if (current === count && count > 0) playSound('success');
  }, [current, count]);

  useEffect(() => {
    async function fetchHeroImage() {
      // Find top game title
      const topGameCard = cards.find(c => c.type === 'top_game') as any;
      const title = topGameCard?.game?.title;

      if (!title) return;

      try {
        const res = await fetch('/api/igdb/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setHeroImage(data.imageUrl);
        }
      } catch (err) {
        console.error('Failed to fetch hero image:', err);
      }
    }
    fetchHeroImage();
  }, [cards]);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        const isEditable =
          target.isContentEditable ||
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT';
        if (isEditable) {
          return;
        }
      }

      if (event.key === 'ArrowLeft') {
        api.scrollPrev();
      } else if (event.key === 'ArrowRight') {
        api.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [api]);

  const handleShare = async () => {
    if (id) {
      const shareUrl = `${window.location.origin}/wrapped?id=${id}`;
      const summaryCard = cards.find(c => c.type === 'summary') as any;
      const totalGames = summaryCard?.totalGames ?? 0;
      const playtime = totalGames * 20;
      
      const shareData = {
        title: 'My Gaming Wrapped 2025',
        text: `I played ${totalGames} games for over ${playtime} hours this year! Check out my Gaming Wrapped.`,
        url: shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
          return;
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            console.error('Error sharing:', err);
          }
        }
      }

      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "LINK COPIED!",
        description: "Your Game Rewind URL is ready to be shared.",
      });
    }
  };

  const renderCard = (card: WrappedCard, index: number, currentSlide: number) => {
    const slideIndex = index + 2; // Slide 1 is Intro
    const isActive = currentSlide === slideIndex;
    const props = { card, isActive } as any;

    switch (card.type) {
      case 'platform_stats':
        return <PlatformStatsCard {...props} />;
      case 'top_game':
        return <TopGameCard {...props} />;
      case 'summary':
        return <SummaryCard {...props} id={id} />;

      case 'genre_breakdown':
        return <GenreBreakdownCard {...props} />;
      case 'score_distribution':
        return <ScoreDistributionCard {...props} />;

      case 'player_persona':
        return <PlayerPersonaCardComponent {...props} />;

      case 'roast':
        return <RoastCardComponent {...props} />;
      case 'recommendations':
        return <RecommendationsCardComponent {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full min-h-screen flex flex-col items-center justify-center p-4 relative font-body overflow-hidden ${isGenerating ? 'cursor-waiting' : ''}`}>
      {/* Dynamic Background Elements (Desktop Only) */}
      <div className="hidden lg:block absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-pulse" />
        
        {/* Floating Pixels */}
         {floatingPixels.map((pixel, i) => (
           <motion.div
             key={i}
             className="absolute w-4 h-4 bg-primary/10 border border-primary/20 pixel-corners"
             initial={{ 
               x: pixel.x, 
               y: pixel.y,
               rotate: 0 
             }}
             animate={{ 
               y: [null, "-20px", "20px"],
               rotate: [0, 90, 180, 270, 360],
               opacity: [0.1, 0.3, 0.1]
             }}
             transition={{ 
               duration: pixel.duration, 
               repeat: Infinity,
               ease: "linear"
             }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-grid-white-0-05 z-0" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      {/* Slide Progress Indicators (Story Style) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 flex gap-1.5 z-50">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden relative">
            {/* Background static fill */}
            <div 
              className={cn(
                "absolute inset-0 bg-primary/40 transition-opacity",
                current > i ? "opacity-100" : "opacity-0"
              )} 
            />
            {/* Dynamic timer fill */}
            <motion.div 
              className="h-full bg-primary shadow-[0_0_8px_oklch(var(--primary))] relative z-10"
              initial={{ width: "0%" }}
              animate={{ 
                width: current > i ? "100%" : current === i + 1 ? `${slideProgress}%` : "0%" 
              }}
              transition={{ 
                duration: current === i + 1 && isAutoPlaying ? 0.1 : 0.2,
                ease: "linear"
              }}
            />
          </div>
        ))}
      </div>

      {/* Global CRT Effects */}
      {showCrt && (
        <>
          <div className="absolute inset-0 pointer-events-none z-40 crt-overlay opacity-[0.15]" />
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            <div className="scanline" />
          </div>
        </>
      )}

      {/* Floating Audio Toggles */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMusicPlaying(!isMusicPlaying)}
          className="rounded-full bg-background/50 backdrop-blur-sm border-2 border-accent/20 hover:border-accent transition-all"
          title={isMusicPlaying ? "Stop Music" : "Play Retro Music"}
        >
          {isMusicPlaying && !isMuted ? <Music className="h-4 w-4 animate-spin-slow" /> : <Music2 className="h-4 w-4 opacity-50" />}
        </Button>
      </div>

      <RetroFrame 
        className="w-full max-w-xl lg:max-w-4xl z-10"
        onPrev={() => { api?.scrollPrev(); setIsAutoPlaying(false); }}
        onNext={() => { api?.scrollNext(); setIsAutoPlaying(false); }}
        onStart={() => setIsAutoPlaying(!isAutoPlaying)}
        onSelect={() => setShowCrt(!showCrt)}
        onCoin={handleCoin}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleAutoPlay={() => setIsAutoPlaying(!isAutoPlaying)}
      >
        <div className="relative">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {/* Slide 1: Intro */}
              <CarouselItem className="basis-full">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={current === 1 ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="h-[550px] w-full flex flex-col items-center p-4 relative font-body perspective-1000"
            >
              <div className="text-center space-y-4 mb-8 z-10">
                <h1 className="font-headline text-3xl md:text-5xl text-primary uppercase tracking-[0.2em] drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                  Gaming Wrapped
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl font-body tracking-wider max-w-2xl mx-auto">
                  A look back at your journey in gaming.
                </p>
              </div>

              <div className="w-full max-w-md group relative">
                {/* Shadow layer */}
                <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 pixel-corners transform translate-y-2" />

                <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-2 duration-300">
                  <div className="relative bg-card/50 border-2 border-border p-8 flex flex-col items-center text-center overflow-hidden min-h-[400px] justify-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-primary"></div>

                    <div className="w-48 h-64 mb-6 relative mt-2">
                      <div className="absolute inset-0 bg-primary opacity-20 blur-xl rounded-full"></div>
                      <div className="relative w-full h-full bg-background border-4 border-foreground shadow-[4px_4px_0px_oklch(var(--primary))] pixel-corners overflow-hidden group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                        {heroImage ? (
                          <Image
                            src={heroImage}
                            alt="Top Game"
                            loading="eager"
                            width={192}
                            height={256}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                            unoptimized
                          />
                        ) : (
                          <>
                            <Gamepad2 className="w-24 h-24 text-primary" />
                            <div className="absolute inset-0 crt-overlay opacity-40"></div>
                          </>
                        )}
                        {/* Scanlines effect */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                      </div>
                    </div>

                    <h2 className="font-headline text-2xl md:text-3xl text-foreground uppercase leading-tight mb-2 tracking-wide drop-shadow-md">
                      Your<br />Highlights
                    </h2>

                    <div className="w-full border-t-2 border-dashed border-border my-6"></div>


                  </div>

                  <button
                    onClick={handleStartWrapped}
                    disabled={isPoweringUp}
                    className="w-full bg-foreground text-background py-4 px-4 text-center cursor-pointer hover:bg-primary hover:text-white transition-all duration-200 group/btn disabled:opacity-50"
                  >
                    <span className="font-headline text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      {isPoweringUp ? (
                        <>BOOTING... <Loader2 className="w-4 h-4 animate-spin" /></>
                      ) : (
                        <>Start Wrapped <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </CarouselItem>

          {cards.map((card, index) => {
            const renderedCard = renderCard(card, index, current);
            if (!renderedCard) return null;
            return (
              <CarouselItem className="basis-full pt-4 pb-4" key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={current === index + 2 ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full relative"
                >
                  <TiltCard className="w-full h-full">
                    {renderedCard}
                  </TiltCard>
                  
                  {/* Per-slide Share Button */}
                  <div className="absolute bottom-4 right-4 z-30">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-background/80 backdrop-blur-sm border-2 border-border font-headline text-[8px] h-8 px-3"
                      onClick={() => {
                        const url = `/api/wrapped/${id}/og?cardIndex=${index}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Share2 className="w-3 h-3 mr-1" /> SHARE SLIDE
                    </Button>
                  </div>
                </motion.div>
              </CarouselItem>
            );
          }).filter(Boolean)}

          {/* Final Slide */}
          <CarouselItem className="basis-full">
            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={current === cards.length + 2 ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.95 }}
               transition={{ duration: 0.5 }}
               className="h-[550px] w-full flex flex-col items-center gap-4 p-4 perspective-1000"
            >
              <div className="text-center space-y-2">
                <h2 className="font-headline text-2xl md:text-3xl text-foreground uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
                  That&apos;S A WRAP!
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl font-body">
                  Your gaming journey in numbers.
                </p>
              </div>

              <div className="w-full max-w-lg group relative">
                {/* Shadow layer */}
                <div className="absolute -bottom-2 -right-2 h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 pixel-corners translate-y-2" />

                <div className="relative bg-card border-4 border-border p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
                  <div className="relative bg-card/50 border-2 border-border p-8 flex flex-col items-center text-center overflow-hidden min-h-[400px]">
                    <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none text-foreground">
                      <Gift className="w-36 h-36 rotate-12" />
                    </div>

                    <div className="relative z-10 mb-8">
                      <span className="inline-block bg-accent text-accent-foreground font-headline text-[10px] md:text-xs px-3 py-1 uppercase tracking-widest border-2 border-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        All-Time Overview
                      </span>
                    </div>

                    {(() => {
                      const summaryCard = cards.find(c => c.type === 'summary') as any;
                      const platformCard = cards.find(c => c.type === 'platform_stats') as any;

                      const totalGames = summaryCard?.totalGames ?? 0;
                      const avgScore = summaryCard?.averageScore ?? 0;
                      const estimatedHours = totalGames * 20; // estimate
                      const completionRate = summaryCard?.completionPercentage;
                      const topPlatform = platformCard?.data?.[0]?.platform;

                      const secondaryStatLabel = completionRate !== undefined ? "Completion Rate" : (topPlatform ? "Top Platform" : null);
                      const secondaryStatValue = completionRate !== undefined ? `${completionRate}%` : topPlatform;

                      return (
                        <>
                          <div className="w-full grid grid-cols-2 gap-6 relative z-10 mb-8">
                            <div className="flex flex-col items-center justify-center p-4 bg-background/80 border-2 border-dashed border-border pixel-corners backdrop-blur-sm">
                              <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                              <h3 className="font-headline text-3xl md:text-4xl text-primary drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)] mb-1">
                                {totalGames}
                              </h3>
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Games</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-background/80 border-2 border-dashed border-border pixel-corners backdrop-blur-sm">
                              <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                              <h3 className="font-headline text-3xl md:text-4xl text-accent drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)] mb-1">
                                {avgScore.toFixed(1)}
                              </h3>
                              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Avg Score</span>
                            </div>
                          </div>

                          <div className="w-full relative z-10 bg-background/40 border border-border p-4 pixel-corners">
                            <div className="flex justify-between items-center text-left">
                              <div className={secondaryStatLabel ? "" : "w-full text-center"}>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Estimated Playtime</p>
                                <p className="font-headline text-lg text-cyan-600 dark:text-cyan-400">{estimatedHours.toLocaleString()} <span className="text-xs text-muted-foreground font-body">HRS</span></p>
                              </div>
                              {secondaryStatLabel && (
                                <div className="text-right">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{secondaryStatLabel}</p>
                                  <p className="font-headline text-lg text-emerald-600 dark:text-emerald-400 truncate max-w-[150px]">{secondaryStatValue}</p>
                                </div>
                              )}
                            </div>
                            {completionRate !== undefined && (
                              <div className="w-full bg-secondary h-2 mt-3 pixel-corners overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-1000"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col gap-3 w-full relative z-10">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button className="font-headline text-[8px] tracking-wider pixel-corners h-12 bg-black hover:bg-zinc-900 text-white border-2 border-white/10" onClick={handleTwitterShare}>
                          <Twitter className="mr-1.5 h-3 w-3 fill-current" /> SHARE TO X
                        </Button>
                        <Button className="font-headline text-[8px] tracking-wider pixel-corners h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:brightness-110 text-white border-2 border-white/10" onClick={handleInstagramShare}>
                          <Share2 className="mr-1.5 h-3 w-3" /> SHARE STORY
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          variant="outline"
                          asChild
                          className="font-headline text-[8px] tracking-wider pixel-corners h-10 border-2"
                        >
                          <a href={`/api/wrapped/${id}/og?download=true&pro=false`} download={`gaming-wrapped-${id}.png`}>
                            DL FREE (X)
                          </a>
                        </Button>

                        <Button
                          variant="outline"
                          asChild
                          className="font-headline text-[8px] tracking-wider pixel-corners h-10 border-2"
                        >
                          <a href={`/api/wrapped/${id}/og?download=true&pro=false&aspect=vertical`} download={`gaming-story-${id}.png`}>
                            DL FREE (STORY)
                          </a>
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          asChild
                          className="font-headline text-[8px] tracking-wider pixel-corners h-10 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        >
                          <a 
                            href="https://ko-fi.com/glowstringman" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1"
                          >
                            GET PRO CARD
                          </a>
                        </Button>

                        <Button
                          asChild
                          className="font-headline text-[8px] tracking-wider pixel-corners h-10 bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-500/50 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                        >
                          <a 
                            href="https://ko-fi.com/glowstringman" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1"
                          >
                            GET PRO STORY
                          </a>
                        </Button>
                      </div>

                      <div 
                        className="w-full mt-1 p-3 border-2 border-accent/30 bg-accent/5 pixel-corners relative overflow-hidden group cursor-pointer hover:bg-accent/10 transition-colors" 
                        onClick={() => window.open('https://ko-fi.com/glowstringman', '_blank')}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left flex flex-col">
                             <span className="font-headline text-accent text-[10px] tracking-widest uppercase">Loving the app?</span>
                             <span className="text-[9px] text-muted-foreground font-body">Support development & remove watermarks.</span>
                          </div>
                          <div className="h-8 w-8 bg-accent text-white flex items-center justify-center pixel-corners shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                             <Heart className="w-4 h-4 fill-current animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </CarouselItem>

            </CarouselContent>
            {current > 1 && <CarouselPrevious className="left-[-50px] text-foreground h-10 w-10" />}
            {current < count && <CarouselNext className="right-[-50px] text-foreground h-10 w-10" />}
          </Carousel>
          
          {/* Subtle Watermark */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 opacity-30 pointer-events-none">
            <span className="font-headline text-[6px] text-muted-foreground tracking-[0.3em]">
              GAMINGWRAPPED.COM
            </span>
          </div>
        </div>
      </RetroFrame>
    </div>
  );
}
