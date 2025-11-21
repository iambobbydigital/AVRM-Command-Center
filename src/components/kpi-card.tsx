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
  const trendColor = change && change > 0 ? "text-emerald-400" : change && change < 0 ? "text-red-400" : "text-neutral-500";

  return (
    <Card className="p-6 bg-neutral-900 border-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {target && (
            <p className="text-sm text-neutral-500 mt-1">Target: {target}</p>
          )}
        </div>
        <Badge
          variant="outline"
          className={cn(
            status === "good" && "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
            status === "warning" && "border-amber-500/50 text-amber-400 bg-amber-500/10",
            status === "bad" && "border-red-500/50 text-red-400 bg-red-500/10"
          )}
        >
          {status === "good" ? "On Track" : status === "warning" ? "At Risk" : "Behind"}
        </Badge>
      </div>
      {change !== undefined && (
        <div className={cn("flex items-center gap-1 mt-4 text-sm", trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span>{change > 0 ? "+" : ""}{change}%</span>
          <span className="text-neutral-500">{changeLabel}</span>
        </div>
      )}
    </Card>
  );
}
