import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationsCard } from "@/types";

interface RecommendationsCardProps {
  card: RecommendationsCard;
}

export function RecommendationsCardComponent({ card }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {card.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
