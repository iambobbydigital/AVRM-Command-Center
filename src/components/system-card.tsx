import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, ExternalLink } from "lucide-react";

interface SystemCardProps {
  name: string;
  description: string;
  status: "healthy" | "warning" | "error";
  lastRun?: string;
  responseTime?: number;
  url?: string;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    label: "Healthy",
    color: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  warning: {
    icon: AlertCircle,
    label: "Warning",
    color: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  error: {
    icon: XCircle,
    label: "Error",
    color: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
  },
};

export function SystemCard({
  name,
  description,
  status,
  lastRun,
  responseTime,
  url,
}: SystemCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="p-4 bg-neutral-900 border-neutral-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-white">{name}</h4>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-neutral-300"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className={config.badge}>
          {config.label}
        </Badge>
      </div>
      {(lastRun || responseTime) && (
        <div className="mt-3 pt-3 border-t border-neutral-800 flex gap-4 text-xs text-neutral-500">
          {lastRun && <span>Last run: {lastRun}</span>}
          {responseTime && <span>Response: {responseTime}ms</span>}
        </div>
      )}
    </Card>
  );
}
