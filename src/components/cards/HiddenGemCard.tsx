'use client';

import { HiddenGemCard as HiddenGemCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gem } from 'lucide-react';

export function HiddenGemCard({ card }: { card: HiddenGemCardType }) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center overflow-y-auto">
        <Gem className="w-20 h-20 text-primary" />
        <p className="text-4xl font-bold font-headline mt-4 text-primary">{card.game.title}</p>
        <p className="text-2xl text-muted-foreground mt-2">on {card.game.platform}</p>
        {card.game.notes && (
            <p className="text-lg mt-4 italic max-w-md">"{card.game.notes}"</p>
        )}
      </CardContent>
    </Card>
  );
}
