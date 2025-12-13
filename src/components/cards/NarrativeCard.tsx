'use client';

import { NarrativeCard as NarrativeCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function NarrativeCard({ card }: { card: NarrativeCardType }) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-invert text-xl leading-relaxed max-w-md overflow-y-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {card.content}
        </ReactMarkdown>
      </CardContent>
    </Card>
  );
}
