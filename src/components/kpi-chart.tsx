"use client";

import { Card } from "@/components/ui/card";
import { AreaChart, BarList } from "@tremor/react";

interface KPIChartProps {
  title: string;
  data: Array<{ date: string; value: number }>;
  valueFormatter?: (value: number) => string;
}

export function KPIAreaChart({ title, data, valueFormatter }: KPIChartProps) {
  return (
    <Card className="p-6 bg-neutral-900 border-neutral-800">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <AreaChart
        className="h-48 [&_.tremor-AreaChart-axis]:text-neutral-400 [&_.tremor-AreaChart-tick]:text-neutral-400"
        data={data}
        index="date"
        categories={["value"]}
        colors={["blue"]}
        valueFormatter={valueFormatter}
        showLegend={false}
        showGridLines={false}
      />
    </Card>
  );
}

interface TargetComparisonProps {
  title: string;
  items: Array<{ name: string; value: number; target: number }>;
}

export function TargetComparison({ title, items }: TargetComparisonProps) {
  const barData = items.map((item) => ({
    name: item.name,
    value: Math.round((item.value / item.target) * 100),
  }));

  return (
    <Card className="p-6 bg-neutral-900 border-neutral-800">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <BarList
        data={barData}
        valueFormatter={(v: number) => `${v}%`}
        color="blue"
        className="[&_.tremor-BarList-bar]:text-neutral-200 [&_span]:text-neutral-300"
      />
    </Card>
  );
}
