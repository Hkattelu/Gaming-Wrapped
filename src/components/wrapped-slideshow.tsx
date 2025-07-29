"use client";

import { WrappedData } from "@/types";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "./logo";
import { Gamepad2, Gift, Share2, Sparkles, Star, Trophy } from "lucide-react";
import { Bar, BarChart, YAxis, XAxis, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const platformColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function WrappedSlideshow({ data, id }: { data: WrappedData, id: string | null }) {
  const { toast } = useToast();
  const { basicStats, aiResponse } = data;

  const narrativeSlides = aiResponse.narrative.split('\n\n').filter(p => p.trim().length > 20);
  
  const chartData = basicStats.platformDistribution.slice(0, 5);
  const chartConfig = {
    count: {
      label: "Games",
    },
    ...Object.fromEntries(chartData.map((item, index) => [item.platform, { label: item.platform, color: platformColors[index % platformColors.length] }]))
  } satisfies ChartConfig

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

  const slideBaseClass = "h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl";

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative font-body">
        <div className="absolute inset-0 bg-grid-white/[0.05] z-0" />
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <Carousel className="w-full max-w-xl z-10">
        <CarouselContent>
          {/* Slide 1: Intro */}
          <CarouselItem>
            <Card className={slideBaseClass}>
                <Sparkles className="w-20 h-20 text-accent animate-pulse" />
                <h2 className="text-5xl font-headline mt-6 tracking-widest">YOUR GAME REWIND</h2>
                <p className="text-muted-foreground mt-2 text-lg">A look back at your epic year in gaming.</p>
                <Logo className="mt-8 text-4xl" />
            </Card>
          </CarouselItem>

          {/* Slide 2: Total Games */}
          <CarouselItem>
             <Card className={slideBaseClass}>
                <CardHeader>
                    <CardDescription className="text-2xl tracking-wide">This year you conquered</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <div className="text-9xl font-bold font-headline text-primary animate-bounce">{basicStats.totalGames}</div>
                    <div className="text-5xl font-headline mt-2">games!</div>
                    <Gamepad2 className="w-20 h-20 text-muted-foreground mt-8"/>
                </CardContent>
             </Card>
          </CarouselItem>
          
          {/* Slide 3: Top Game */}
          {basicStats.topGame && (
            <CarouselItem>
              <Card className={slideBaseClass}>
                <CardHeader>
                    <CardTitle className="font-headline text-4xl tracking-widest">YOUR SHINING STAR</CardTitle>
                    <CardDescription className="text-lg">The one that stood out from the rest</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Trophy className="w-20 h-20 text-yellow-400" />
                    <p className="text-4xl font-bold font-headline mt-4 text-primary">{basicStats.topGame.title}</p>
                    <p className="text-2xl text-muted-foreground mt-2">on {basicStats.topGame.platform}</p>
                    {typeof basicStats.topGame.score === 'number' && (
                        <div className="flex items-center gap-2 mt-4 text-3xl">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400"/> 
                            <span className="font-bold">{basicStats.topGame.score} / 10</span>
                        </div>
                    )}
                </CardContent>
              </Card>
            </CarouselItem>
          )}

          {/* Slide 4: Platform Distribution */}
          {basicStats.platformDistribution.length > 0 && (
            <CarouselItem>
              <Card className={slideBaseClass + " justify-between"}>
                <CardHeader>
                    <CardTitle className="font-headline text-4xl tracking-widest">PLATFORM ALLEGIANCE</CardTitle>
                    <CardDescription className="text-lg">Where you spent most of your time.</CardDescription>
                </CardHeader>
                <CardContent className="w-full h-64">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="platform" 
                                type="category" 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontFamily: 'var(--font-vt323)' }}
                                tickMargin={10}
                                width={120}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                            <Bar dataKey="count" radius={5}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={platformColors[index % platformColors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
              </Card>
            </CarouselItem>
          )}
          
          {/* Narrative Slides */}
          {narrativeSlides.map((paragraph, index) => (
             <CarouselItem key={`narrative-${index}`}>
                <Card className={slideBaseClass}>
                    <CardHeader>
                        <CardTitle className="font-headline text-4xl tracking-widest">YOUR GAMING SAGA</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert text-xl leading-relaxed max-w-md">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {paragraph}
                        </ReactMarkdown>
                    </CardContent>
                </Card>
             </CarouselItem>
          ))}

          {/* AI Key Stats Slide */}
          <CarouselItem>
            <Card className={slideBaseClass}>
              <CardHeader>
                <CardTitle className="font-headline text-4xl tracking-widest">AI-NALYSIS</CardTitle>
                <CardDescription className="text-lg">Stats from the ghost in the machine.</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm prose-invert text-left w-full max-w-md p-4 bg-black/20 rounded-lg prose-table:w-full prose-td:p-2 prose-th:p-2">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {aiResponse.keyStats}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </CarouselItem>


          {/* Final Slide */}
          <CarouselItem>
             <Card className={slideBaseClass}>
                <Gift className="w-20 h-20 text-primary" />
                <h2 className="text-5xl font-headline font-bold mt-4 tracking-widest">THAT'S A WRAP!</h2>
                <p className="text-muted-foreground text-lg mt-2 max-w-xs">Share your year in gaming with your friends!</p>
                <Button className="mt-8 font-headline text-xl tracking-wider" onClick={handleShare}>
                    <Share2 className="mr-2 h-5 w-5"/>
                    SHARE MY REWIND
                </Button>
            </Card>
          </CarouselItem>

        </CarouselContent>
        <CarouselPrevious className="left-[-50px] text-foreground h-10 w-10" />
        <CarouselNext className="right-[-50px] text-foreground h-10 w-10" />
      </Carousel>
    </div>
  );
}
