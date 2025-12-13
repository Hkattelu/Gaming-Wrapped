import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoastCard } from "@/types";
import { Flame } from "lucide-react";

interface RoastCardProps {
  card: RoastCard;
}

export function RoastCardComponent({ card }: RoastCardProps) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center overflow-y-auto max-w-md">
        <div className="relative mb-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full animate-pulse-slow" />
            <Flame className="w-24 h-24 text-primary" />
        </div>
        <p className="text-xl leading-relaxed mt-2">{card.roast}</p>
      </CardContent>
    </Card>
  );
}
