"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationsCard, Recommendation } from "@/types";
import { Lightbulb, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface RecommendationsCardProps {
  card: RecommendationsCard;
}

interface RecommendationWithUrl extends Recommendation {
  igdbUrl?: string;
}

export function RecommendationsCardComponent({ card }: RecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<RecommendationWithUrl[]>(
    card.recommendations.map(rec => ({ ...rec }))
  );

  useEffect(() => {
    async function fetchIgdbUrls() {
      const updated = await Promise.all(
        card.recommendations.map(async (rec) => {
          if (rec.igdbUrl) return rec;
          try {
            const res = await fetch('/api/igdb/game', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: rec.game }),
            });
            const data = await res.json();
            return { ...rec, igdbUrl: data.url ?? undefined };
          } catch {
            return rec;
          }
        })
      );
      setRecommendations(updated);
    }
    fetchIgdbUrls();
  }, [card.recommendations]);

  return (
    <Card className="h-[600px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center overflow-y-auto max-w-md w-full">
        <div className="relative mb-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full animate-pulse-slow" />
          <Lightbulb className="w-24 h-24 text-primary" />
        </div>
        <ul className="space-y-4 text-left w-full mt-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="border-b border-primary/10 pb-3 last:border-0">
              <div className="flex items-center gap-2">
                {rec.igdbUrl ? (
                  <a
                    href={rec.igdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    {rec.game}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-lg font-semibold">{rec.game}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{rec.blurb}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
