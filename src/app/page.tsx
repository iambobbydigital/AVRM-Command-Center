import { MetricGrid } from "@/components/metric-grid";
import { Card } from "@/components/ui/card";

// Placeholder data - will be replaced with API calls
const dashboardMetrics = [
  {
    title: "Active Properties",
    value: 12,
    target: 15,
    change: 20,
    status: "good" as const,
  },
  {
    title: "Monthly Revenue",
    value: "$24,500",
    target: "$30,000",
    change: 8,
    status: "warning" as const,
  },
  {
    title: "Pipeline Value",
    value: "$45,000",
    target: "$50,000",
    change: 15,
    status: "good" as const,
  },
  {
    title: "Avg Occupancy",
    value: "68%",
    target: "75%",
    change: -3,
    status: "warning" as const,
  },
  {
    title: "Avg Review Score",
    value: "4.8",
    target: "4.8",
    change: 2,
    status: "good" as const,
  },
  {
    title: "Open Leads",
    value: 47,
    change: 32,
    status: "good" as const,
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Overview of your vacation rental operations</p>
      </div>

      <MetricGrid metrics={dashboardMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-slate-500 text-sm">Activity feed coming soon...</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <p className="text-slate-500 text-sm">Status indicators coming soon...</p>
        </Card>
      </div>
    </div>
  );
}
