'use client';

import { ScoreDistributionCard as ScoreDistributionCardType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, YAxis, XAxis, Cell, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const scoreColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function ScoreDistributionCard({ card }: { card: ScoreDistributionCardType }) {
  const chartData = card.data;
  const chartConfig = {
    count: {
      label: "Games",
    },
    ...Object.fromEntries(chartData.map((item, index) => [item.range, { label: item.range, color: scoreColors[index % scoreColors.length] }]))
  } satisfies ChartConfig

  return (
    <Card className="h-[600px] flex flex-col justify-center items-center text-center p-6 bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-4xl tracking-widest">{card.title}</CardTitle>
        <CardDescription className="text-lg">{card.description}</CardDescription>
      </CardHeader>
      <CardContent className="w-full h-96">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
            <XAxis type="number" hide />
            <YAxis 
                dataKey="range" 
                type="category" 
                tickLine={false} 
                axisLine={false}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontFamily: 'var(--font-vt323)' }}
                tickMargin={10}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
            <Bar dataKey="count" radius={5}>
                <LabelList dataKey="count" position="right" style={{ fill: 'hsl(var(--foreground))', fontSize: 14, fontFamily: 'var(--font-vt323)' }} />
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={scoreColors[index % scoreColors.length]} />
                ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
