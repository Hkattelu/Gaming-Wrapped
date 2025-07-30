import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoastCard } from "@/types";

interface RoastCardProps {
  card: RoastCard;
}

export function RoastCardComponent({ card }: RoastCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{card.roast}</p>
      </CardContent>
    </Card>
  );
}
