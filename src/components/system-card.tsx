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
    color: "text-green-600",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  warning: {
    icon: AlertCircle,
    label: "Warning",
    color: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  error: {
    icon: XCircle,
    label: "Error",
    color: "text-red-600",
    badge: "bg-red-100 text-red-700 border-red-200",
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
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">{name}</h4>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className={config.badge}>
          {config.label}
        </Badge>
      </div>
      {(lastRun || responseTime) && (
        <div className="mt-3 pt-3 border-t flex gap-4 text-xs text-slate-400">
          {lastRun && <span>Last run: {lastRun}</span>}
          {responseTime && <span>Response: {responseTime}ms</span>}
        </div>
      )}
    </Card>
  );
}
