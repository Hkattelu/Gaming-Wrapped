import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamingSpiritAnimalCard } from "@/types";

interface GamingSpiritAnimalCardProps {
  card: GamingSpiritAnimalCard;
}

export function GamingSpiritAnimalCardComponent({ card }: GamingSpiritAnimalCardProps) {
  return (
    <Card>
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
