import { SystemCard } from "@/components/system-card";
import { Card } from "@/components/ui/card";

// Placeholder data
const systems = [
  {
    name: "Airtable",
    description: "Listing Locator database and automations",
    status: "healthy" as const,
    lastRun: "2 min ago",
    responseTime: 245,
    url: "https://airtable.com",
  },
  {
    name: "GoHighLevel",
    description: "CRM and marketing automation",
    status: "healthy" as const,
    lastRun: "5 min ago",
    responseTime: 312,
    url: "https://app.gohighlevel.com",
  },
  {
    name: "Hostaway",
    description: "Property management system",
    status: "healthy" as const,
    lastRun: "1 min ago",
    responseTime: 189,
    url: "https://dashboard.hostaway.com",
  },
  {
    name: "AirROI API",
    description: "Vacation rental performance data",
    status: "healthy" as const,
    lastRun: "12 min ago",
    responseTime: 523,
  },
  {
    name: "Endato API",
    description: "Property owner skip tracing",
    status: "warning" as const,
    lastRun: "1 hour ago",
    responseTime: 1250,
  },
  {
    name: "PriceLabs",
    description: "Dynamic pricing engine",
    status: "healthy" as const,
    lastRun: "30 min ago",
    responseTime: 156,
    url: "https://pricelabs.co",
  },
  {
    name: "Claude API",
    description: "AI analysis and content generation",
    status: "healthy" as const,
    lastRun: "8 min ago",
    responseTime: 890,
  },
  {
    name: "Stripe",
    description: "Payment processing and invoicing",
    status: "healthy" as const,
    lastRun: "1 day ago",
    responseTime: 210,
    url: "https://dashboard.stripe.com",
  },
];

const automations = [
  { name: "Reverse Geocoding", status: "active", runs: 247, lastRun: "2 min ago" },
  { name: "Skip Trace Lookup", status: "active", runs: 156, lastRun: "5 min ago" },
  { name: "AirROI Data Fetch", status: "active", runs: 189, lastRun: "12 min ago" },
  { name: "Photo Scoring", status: "paused", runs: 45, lastRun: "2 days ago" },
  { name: "Market Benchmarks", status: "active", runs: 12, lastRun: "1 hour ago" },
];

export default function SystemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">System Status</h2>
        <p className="text-neutral-400">Monitor integrations and automation health</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systems.map((system) => (
            <SystemCard key={system.name} {...system} />
          ))}
        </div>
      </div>

      <Card className="p-6 bg-neutral-900 border-neutral-800">
        <h3 className="text-lg font-semibold text-white mb-4">Airtable Automations</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800/50 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase">
                  Automation
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase">
                  Runs (30d)
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-neutral-400 uppercase">
                  Last Run
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {automations.map((auto) => (
                <tr key={auto.name}>
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    {auto.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        auto.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-neutral-700 text-neutral-400"
                      }`}
                    >
                      {auto.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-300">{auto.runs}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">{auto.lastRun}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
