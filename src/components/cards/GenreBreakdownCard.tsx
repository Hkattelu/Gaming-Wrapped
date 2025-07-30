'use client';

import { GenreBreakdownCard as GenreBreakdownCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const genreColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function GenreBreakdownCard({ card }: { card: GenreBreakdownCardType }) {
  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full h-64">
        <PieChart width={400} height={250}>
          <Pie data={card.data} dataKey="count" nameKey="genre" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
            {card.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={genreColors[index % genreColors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </CardContent>
    </Card>
  );
}
