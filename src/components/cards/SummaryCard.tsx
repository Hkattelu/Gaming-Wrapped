'use client';

import { SummaryCard as SummaryCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Gamepad2 } from 'lucide-react';

export function SummaryCard({ card }: { card: SummaryCardType }) {
  return (
    <Card className="h-[600px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full animate-pulse-slow" />
            <Gamepad2 className="w-48 h-48 text-primary" />
        </div>
        <div className="flex items-center gap-4 mt-8">
            <div className="text-8xl font-bold font-headline text-primary">{card.totalGames}</div>
            <div className="text-4xl font-headline">games!</div>
        </div>
      </CardContent>
    </Card>
  );
}
