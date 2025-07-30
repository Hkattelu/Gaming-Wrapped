'use client';

import { WrappedData, WrappedCard } from "@/types";
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

export function WrappedSlideshow({ data, id }: { data: WrappedData, id: string | null }) {
  const { toast } = useToast();
  const { cards } = data;
  console.log(cards);

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
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative font-body">
        <div className="absolute inset-0 bg-grid-white/[0.05] z-0" />
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Carousel className="w-full max-w-xl z-10">
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
            <CarouselItem key={index}>
              {renderCard(card)}
            </CarouselItem>
          ))}

          {/* Final Slide */}
          <CarouselItem>
            <div className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
                <Gift className="w-20 h-20 text-primary" />
                <h2 className="text-5xl font-headline font-bold mt-4 tracking-widest">THAT'S A WRAP!</h2>
                <p className="text-muted-foreground text-lg mt-2 max-w-xs">Share your year in gaming with your friends!</p>
                <Button className="mt-8 font-headline text-xl tracking-wider" onClick={handleShare}>
                    <Share2 className="mr-2 h-5 w-5"/>
                    SHARE MY REWIND
                </Button>
            </div>
          </CarouselItem>

        </CarouselContent>
        <CarouselPrevious className="left-[-50px] text-foreground h-10 w-10" />
        <CarouselNext className="right-[-50px] text-foreground h-10 w-10" />
      </Carousel>
    </div>
  );
}