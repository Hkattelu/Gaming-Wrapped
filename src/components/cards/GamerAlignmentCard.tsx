import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamerAlignmentCard } from "@/types";
import { Swords } from "lucide-react";

interface GamerAlignmentCardProps {
  card: GamerAlignmentCard;
}

export function GamerAlignmentCardComponent({ card }: GamerAlignmentCardProps) {
  return (
    <Card className="h-[600px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center overflow-y-auto max-w-md">
        <div className="relative mb-4">
            <div className="absolute left-1 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full animate-pulse-slow" />
            <Swords className="w-24 h-24 text-primary" />
        </div>
        <p className="text-4xl font-bold font-headline mt-4 text-primary">{card.alignment}</p>
        <p className="text-xl leading-relaxed mt-2">{card.description}</p>
      </CardContent>
    </Card>
  );
}
