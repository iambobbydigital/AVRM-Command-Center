import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  target?: string | number;
  change?: number; // Percentage change
  changeLabel?: string;
  status?: "good" | "warning" | "bad";
}

export function KPICard({
  title,
  value,
  target,
  change,
  changeLabel = "vs last month",
  status = "good",
}: KPICardProps) {
  const TrendIcon = change && change > 0 ? TrendingUp : change && change < 0 ? TrendingDown : Minus;
  const trendColor = change && change > 0 ? "text-green-600" : change && change < 0 ? "text-red-600" : "text-slate-400";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {target && (
            <p className="text-sm text-slate-400 mt-1">Target: {target}</p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            status === "good" && "border-green-500 text-green-700 bg-green-50",
            status === "warning" && "border-yellow-500 text-yellow-700 bg-yellow-50",
            status === "bad" && "border-red-500 text-red-700 bg-red-50"
          )}
        >
          {status === "good" ? "On Track" : status === "warning" ? "At Risk" : "Behind"}
        </Badge>
      </div>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 mt-4 text-sm", trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span>{change > 0 ? "+" : ""}{change}%</span>
          <span className="text-slate-400">{changeLabel}</span>
        </div>
      )}
    </Card>
  );
}
