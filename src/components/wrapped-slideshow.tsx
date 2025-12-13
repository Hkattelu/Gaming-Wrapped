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
import { NarrativeCard } from './cards/NarrativeCard';
import { GenreBreakdownCard } from './cards/GenreBreakdownCard';
import { HiddenGemCard } from './cards/HiddenGemCard';
import { ScoreDistributionCard } from './cards/ScoreDistributionCard';
import { PlayerPersonaCardComponent } from "./cards/PlayerPersonaCard";
import { GamerAlignmentCardComponent } from "./cards/GamerAlignmentCard";
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
      case 'narrative':
        return <NarrativeCard card={card} />;
      case 'genre_breakdown':
        return <GenreBreakdownCard card={card} />;
      case 'score_distribution':
        return <ScoreDistributionCard card={card} />;
      case 'hidden_gem':
        return <HiddenGemCard card={card} />;
      case 'player_persona':
        return <PlayerPersonaCardComponent card={card} />;
      case 'gamer_alignment':
        return <GamerAlignmentCardComponent card={card} />;
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
          <CarouselItem>
            <div className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
                <Sparkles className="w-20 h-20 text-accent animate-pulse" />
                <h2 className="text-5xl font-headline mt-6 tracking-widest">YOUR GAME REWIND</h2>
                <p className="text-muted-foreground mt-2 text-lg">A look back at your epic year in gaming.</p>
                <Logo className="mt-8 text-4xl" />
            </div>
          </CarouselItem>

          {cards.map((card, index) => (
            <CarouselItem className="pt-4 pb-4" key={index}>
              {renderCard(card)}
            </CarouselItem>
          ))}

          {/* Final Slide */}
          <CarouselItem>
            <div className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
                <Gift className="w-20 h-20 text-primary" />
                <h2 className="text-5xl font-headline font-bold mt-4 tracking-widest">THAT&apos;S A WRAP!</h2>
                <p className="text-muted-foreground text-lg mt-2 max-w-xs">Share your wrapped with your friends!</p>
                <Button className="mt-8 font-headline text-xl tracking-wider" onClick={handleShare}>
                    <Share2 className="mr-2 h-5 w-5"/>
                    SHARE MY WRAPPED
                </Button>
                
                <div className="mt-8 pt-6 border-t border-primary/20 w-full max-w-xs">
                  <p className="text-sm text-muted-foreground mb-3">Enjoyed this wrapped?</p>
                  <Button 
                    asChild
                    className="bg-[#FF5E5B] hover:bg-[#FF5E5B]/90 text-white font-headline tracking-wider"
                  >
                    <a 
                      href="https://ko-fi.com/glowstringman" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
                      </svg>
                      SUPPORT ON KO-FI
                    </a>
                  </Button>
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
