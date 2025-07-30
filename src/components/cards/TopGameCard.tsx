'use client';

import { TopGameCard as TopGameCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star, Trophy } from 'lucide-react';

export function TopGameCard({ card }: { card: TopGameCardType }) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Trophy className="w-20 h-20 text-yellow-400" />
        <p className="text-4xl font-bold font-headline mt-4 text-primary">{card.game.title}</p>
        <p className="text-2xl text-muted-foreground mt-2">on {card.game.platform}</p>
        {typeof card.game.score === 'number' && (
            <div className="flex items-center gap-2 mt-4 text-3xl">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400"/> 
                <span className="font-bold">{card.game.score} / 10</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
