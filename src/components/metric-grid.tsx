import { KPICard } from "./kpi-card";

interface Metric {
  title: string;
  value: string | number;
  target?: string | number;
  change?: number;
  status?: "good" | "warning" | "bad";
}

interface MetricGridProps {
  metrics: Metric[];
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <KPICard key={index} {...metric} />
      ))}
    </div>
  );
}
