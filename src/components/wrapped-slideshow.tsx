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
import { Gift, Share2, Sparkles } from "lucide-react";
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
      <div className="absolute inset-0 bg-grid-white/[0.05] z-0" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Carousel className="w-full max-w-xl z-10" setApi={setApi}>
        <CarouselContent>
          {/* Slide 1: Intro */}
          <CarouselItem className="basis-full">
            <div className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
              <Sparkles className="w-20 h-20 text-accent animate-pulse" />
              <h2 className="text-5xl font-headline mt-6 tracking-widest">YOUR GAME REWIND</h2>
              <p className="text-muted-foreground mt-2 text-lg">A look back at your epic year in gaming.</p>
              <Logo className="mt-8 text-4xl" />
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
                <h2 className="font-headline text-2xl md:text-3xl text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(255,46,80,0.5)]">
                  That&apos;S A WRAP!
                </h2>
                <p className="text-gray-400 text-lg md:text-xl font-body">
                  Your gaming journey in numbers.
                </p>
              </div>

              <div className="w-full max-w-lg group relative">
                {/* Shadow layer */}
                <div className="absolute -bottom-2 -right-2 h-full w-full bg-black/50 -z-10 pixel-corners translate-y-2" />

                <div className="relative bg-[#0F0F0F] border-4 border-[#2A2A2A] p-1 pixel-corners shadow-xl transition-transform transform group-hover:-translate-y-1 duration-300">
                  <div className="relative bg-[#111] border-2 border-[#222] p-8 flex flex-col items-center text-center overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 digital-pattern opacity-30 pointer-events-none" />
                    <div className="absolute -top-6 -right-6 p-4 opacity-10 pointer-events-none">
                      <Gift className="w-36 h-36 text-white rotate-12" />
                    </div>

                    <div className="relative z-10 mb-8">
                      <span className="inline-block bg-[#FFE600] text-black font-headline text-[10px] md:text-xs px-3 py-1 uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        {new Date().getFullYear()} Overview
                      </span>
                    </div>

                    {/* Summary Stats */}
                    {(() => {
                      const summaryCard = cards.find(c => c.type === 'summary') as any;
                      const totalGames = summaryCard?.totalGames ?? 0;
                      const avgScore = summaryCard?.averageScore ?? 0;
                      const estimatedHours = totalGames * 20; // estimate
                      const completionRate = avgScore >= 8 ? 85 : 65;

                      return (
                        <>
                          <div className="w-full grid grid-cols-2 gap-6 relative z-10 mb-8">
                            <div className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] border-2 border-dashed border-[#333] pixel-corners backdrop-blur-sm">
                              <Sparkles className="w-8 h-8 text-gray-500 mb-2" />
                              <h3 className="font-headline text-3xl md:text-4xl text-primary drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)] mb-1">
                                {totalGames}
                              </h3>
                              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Games</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-[#1a1a1a] border-2 border-dashed border-[#333] pixel-corners backdrop-blur-sm">
                              <Sparkles className="w-8 h-8 text-gray-500 mb-2" />
                              <h3 className="font-headline text-3xl md:text-4xl text-[#FFE600] drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)] mb-1">
                                {avgScore.toFixed(1)}
                              </h3>
                              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Avg Score</span>
                            </div>
                          </div>

                          <div className="w-full relative z-10 bg-black/40 border border-[#333] p-4 pixel-corners">
                            <div className="flex justify-between items-center text-left">
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Playtime</p>
                                <p className="font-headline text-lg text-[#00F0FF]">{estimatedHours.toLocaleString()} <span className="text-xs text-gray-400 font-body">HRS</span></p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Completion Rate</p>
                                <p className="font-headline text-lg text-[#00FF94]">{completionRate}%</p>
                              </div>
                            </div>
                            <div className="w-full bg-[#222] h-2 mt-3 pixel-corners overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-primary to-[#FFE600] h-full transition-all duration-1000"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
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
                        variant="outline"
                        className="w-full border-2 border-primary/20 hover:border-primary/50 text-white font-headline text-[10px] tracking-wider pixel-corners h-10 bg-transparent"
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
