import { Card } from "@/components/ui/card";

interface FunnelStage {
  name: string;
  count: number;
  value: string;
  color: string;
}

interface PipelineFunnelProps {
  stages: FunnelStage[];
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  const maxCount = Math.max(...stages.map((s) => s.count));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Sales Pipeline</h3>
      <div className="space-y-3">
        {stages.map((stage) => {
          const width = (stage.count / maxCount) * 100;
          return (
            <div key={stage.name} className="relative">
              <div
                className="h-12 rounded-r-md flex items-center px-4 transition-all"
                style={{
                  width: `${Math.max(width, 20)}%`,
                  backgroundColor: stage.color,
                }}
              >
                <span className="text-white font-medium text-sm">
                  {stage.name}
                </span>
              </div>
              <div className="absolute right-0 top-0 h-12 flex items-center gap-4 pr-2">
                <span className="text-slate-600 font-semibold">{stage.count}</span>
                <span className="text-slate-400 text-sm">{stage.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
