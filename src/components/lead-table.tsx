import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Lead {
  id: string;
  propertyAddress: string;
  ownerName: string;
  opportunityScore: number;
  stage: string;
  estimatedValue: string;
}

interface LeadTableProps {
  leads: Lead[];
}

const stageBadgeColor: Record<string, string> = {
  Lead: "bg-neutral-700 text-neutral-200",
  Qualified: "bg-blue-500/20 text-blue-400",
  Meeting: "bg-purple-500/20 text-purple-400",
  Proposal: "bg-orange-500/20 text-orange-400",
  Signed: "bg-emerald-500/20 text-emerald-400",
};

export function LeadTable({ leads }: LeadTableProps) {
  return (
    <Card className="overflow-hidden bg-neutral-900 border-neutral-800">
      <div className="px-6 py-4 border-b border-neutral-800">
        <h3 className="text-lg font-semibold text-white">Top Opportunities</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-800/50 border-b border-neutral-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">
                Est. Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-neutral-800/50">
                <td className="px-6 py-4 text-sm text-white">
                  {lead.propertyAddress}
                </td>
                <td className="px-6 py-4 text-sm text-neutral-300">
                  {lead.ownerName}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      lead.opportunityScore >= 80
                        ? "bg-emerald-500/20 text-emerald-400"
                        : lead.opportunityScore >= 60
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-neutral-700 text-neutral-300"
                    }`}
                  >
                    {lead.opportunityScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge className={stageBadgeColor[lead.stage] || "bg-neutral-700"}>
                    {lead.stage}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-300">
                  {lead.estimatedValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
