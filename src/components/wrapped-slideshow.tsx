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
import { Gift, Share2, Sparkles, Gamepad2, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlatformStatsCard } from './cards/PlatformStatsCard';
import { TopGameCard } from './cards/TopGameCard';
import { SummaryCard } from './cards/SummaryCard';

import { GenreBreakdownCard } from './cards/GenreBreakdownCard';

import { ScoreDistributionCard } from './cards/ScoreDistributionCard';
import { PlayerPersonaCardComponent } from "./cards/PlayerPersonaCard";

import { RoastCardComponent } from "./cards/RoastCard";
import { RecommendationsCardComponent } from "./cards/RecommendationsCard";

export function WrappedSlideshow({ data, id }: { data: WrappedData, id: string | null }) {
  const { toast } = useToast();
  const { cards } = data;
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [heroImage, setHeroImage] = useState<string | null>(null);

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

  const handleShare = () => {
    if (id) {
      const shareUrl = `${window.location.origin}/wrapped?id=${id}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "LINK COPIED!",
        description: "Your Game Rewind URL is ready to be shared.",
      });
    }
  };

  const renderCard = (card: WrappedCard) => {
    switch (card.type) {
      case 'platform_stats':
        return <PlatformStatsCard card={card} />;
      case 'top_game':
        return <TopGameCard card={card} />;
      case 'summary':
        return <SummaryCard card={card} />;

      case 'genre_breakdown':
        return <GenreBreakdownCard card={card} />;
      case 'score_distribution':
        return <ScoreDistributionCard card={card} />;

      case 'player_persona':
        return <PlayerPersonaCardComponent card={card} />;

      case 'roast':
        return <RoastCardComponent card={card} />;
      case 'recommendations':
        return <RecommendationsCardComponent card={card} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative font-body">
      <div className="absolute inset-0 bg-grid-white-0-05 z-0" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Carousel className="w-full max-w-xl z-10" setApi={setApi}>
        <CarouselContent>
          {/* Slide 1: Intro */}
          <CarouselItem className="basis-full">
            <div className="h-[550px] w-full flex flex-col items-center p-4 relative font-body perspective-1000">
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
                          <img
                            src={heroImage}
                            alt="Top Game"
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
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
                    onClick={() => api?.scrollNext()}
                    className="w-full bg-foreground text-background py-4 px-4 text-center cursor-pointer hover:bg-primary hover:text-white transition-all duration-200 group/btn"
                  >
                    <span className="font-headline text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      Start Wrapped <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </CarouselItem>

          {cards.map((card, index) => {
            const renderedCard = renderCard(card);
            if (!renderedCard) return null;
            return (
              <CarouselItem className="basis-full pt-4 pb-4" key={index}>
                {renderedCard}
              </CarouselItem>
            );
          }).filter(Boolean)}

          {/* Final Slide */}
          <CarouselItem className="basis-full">
            <div className="h-[550px] w-full flex flex-col items-center gap-4 p-4 perspective-1000">
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
                    <div className="mt-8 flex flex-col gap-4 w-full relative z-10">
                      <Button className="w-full font-headline text-xs tracking-wider pixel-corners h-12" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        SHARE MY WRAPPED
                      </Button>

                      <Button
                        asChild
                        className="w-full border-2 border-primary/20 hover:border-primary/50 text-white font-headline text-[10px] tracking-wider pixel-corners h-10 bg-cyan-500 hover:bg-cyan-600"
                      >
                        <a
                          href="https://ko-fi.com/glowstringman"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
                          </svg>
                          SUPPORT ON KO-FI
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>

        </CarouselContent>
        {current > 1 && <CarouselPrevious className="left-[-50px] text-foreground h-10 w-10" />}
        {current < count && <CarouselNext className="right-[-50px] text-foreground h-10 w-10" />}
      </Carousel>
    </div>
  );
}
