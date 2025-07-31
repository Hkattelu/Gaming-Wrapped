import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoastCard } from "@/types";

interface RoastCardProps {
  card: RoastCard;
}

export function RoastCardComponent({ card }: RoastCardProps) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{card.roast}</p>
      </CardContent>
    </Card>
  );
}
