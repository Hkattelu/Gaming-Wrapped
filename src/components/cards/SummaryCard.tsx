'use client';

import { SummaryCard as SummaryCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2 } from 'lucide-react';

export function SummaryCard({ card }: { card: SummaryCardType }) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-9xl font-bold font-headline text-primary animate-bounce">{card.totalGames}</div>
        <div className="text-5xl font-headline mt-2">games!</div>
        <Gamepad2 className="w-20 h-20 text-muted-foreground mt-8"/>
      </CardContent>
    </Card>
  );
}
