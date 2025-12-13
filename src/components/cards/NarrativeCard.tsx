'use client';

import { NarrativeCard as NarrativeCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollText } from 'lucide-react';

export function NarrativeCard({ card }: { card: NarrativeCardType }) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-invert text-xl leading-relaxed max-w-md overflow-y-auto">
        <div className="relative w-full flex justify-center mb-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full animate-pulse-slow" />
            <ScrollText className="w-24 h-24 text-primary" />
        </div>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {card.content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
