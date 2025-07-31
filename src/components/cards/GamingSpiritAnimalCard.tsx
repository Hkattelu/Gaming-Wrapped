import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamingSpiritAnimalCard } from "@/types";

interface GamingSpiritAnimalCardProps {
  card: GamingSpiritAnimalCard;
}

export function GamingSpiritAnimalCardComponent({ card }: GamingSpiritAnimalCardProps) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{card.animal}</p>
        <p>{card.description}</p>
      </CardContent>
    </Card>
  );
}
