import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerPersonaCard } from "@/types";

interface PlayerPersonaCardProps {
  card: PlayerPersonaCard;
}

export function PlayerPersonaCardComponent({ card }: PlayerPersonaCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{card.persona}</p>
        <p>{card.description}</p>
      </CardContent>
    </Card>
  );
}
