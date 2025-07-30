import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GamerAlignmentCard } from "@/types";

interface GamerAlignmentCardProps {
  card: GamerAlignmentCard;
}

export function GamerAlignmentCardComponent({ card }: GamerAlignmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{card.alignment}</p>
        <p>{card.description}</p>
      </CardContent>
    </Card>
  );
}
