'use client';

import { ScoreDistributionCard as ScoreDistributionCardType } from '@/types';
import { Bar, BarChart, YAxis, XAxis, Cell, LabelList, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LayoutPanelLeft } from 'lucide-react';

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
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-4">
      {/* Retro grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Header */}
      <div className="text-center space-y-4 mb-8 relative z-10">
        <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl text-foreground uppercase tracking-widest flex items-center justify-center gap-2 drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">
          <LayoutPanelLeft className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
          {card.title}
        </h1>
        <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-body">
          {card.description}
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-2xl group relative z-10">
        <div className="relative bg-card border-4 border-border p-1 shadow-2xl transition-transform hover:-translate-y-2 duration-300 pixel-corners">

          {/* Inner card content */}
          <div className="relative bg-card/50 border-2 border-border/50 p-8 flex flex-col items-center overflow-hidden">

            {/* Background decoration */}
            <div className="absolute -bottom-6 -right-6 p-4 opacity-10 pointer-events-none text-foreground">
              <LayoutPanelLeft className="w-48 h-48 rotate-12" />
            </div>

            <div className="w-full h-[350px] relative z-20">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 20, right: 60, top: 20, bottom: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="range"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'currentColor', fontSize: 12, className: 'font-headline uppercase text-muted-foreground' }}
                      tickMargin={10}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Bar dataKey="count" radius={4} barSize={40}>
                      <LabelList dataKey="count" position="right" className="font-headline text-lg fill-foreground" offset={15} />
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={scoreColors[index % scoreColors.length]} className="opacity-80 hover:opacity-100 transition-opacity" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Legend/Footer Information */}
            <div className="w-full mt-6 flex justify-center items-center gap-4 text-[10px] text-muted-foreground font-headline tracking-widest border-t-2 border-dashed border-border pt-4">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Score Spectrum
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Rating Density
              </span>
            </div>
          </div>

          {/* Share Button Placeholder */}
          <div className="bg-foreground text-background py-3 px-4 text-center cursor-pointer hover:bg-primary transition-colors duration-200">
            <span className="font-headline text-xs uppercase tracking-widest animate-pulse">Share Card</span>
          </div>
        </div>

        {/* Shadow layer */}
        <div className="absolute -bottom-4 left-4 right-[-10px] h-full w-full bg-foreground/10 dark:bg-black/50 -z-10 transform translate-y-2 pixel-corners" />
      </div>
    </div>
  );
}
