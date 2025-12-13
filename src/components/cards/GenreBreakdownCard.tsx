'use client';

import { GenreBreakdownCard as GenreBreakdownCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const genreColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function GenreBreakdownCard({ card }: { card: GenreBreakdownCardType }) {
  // Compute top 4 genres and roll the rest into "Other"
  const sorted = [...card.data].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 4);
  const remainder = sorted.slice(4);
  const otherCount = remainder.reduce((sum, cur) => sum + cur.count, 0);
  const processedData = otherCount > 0 ? [...top, { genre: 'Other', count: otherCount }] : top;

  return (
    <Card className="h-[550px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={processedData} dataKey="count" nameKey="genre" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" labelLine={false}>
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={genreColors[index % genreColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
