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
  Lead: "bg-slate-100 text-slate-700",
  Qualified: "bg-blue-100 text-blue-700",
  Meeting: "bg-purple-100 text-purple-700",
  Proposal: "bg-orange-100 text-orange-700",
  Signed: "bg-green-100 text-green-700",
};

export function LeadTable({ leads }: LeadTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">Top Opportunities</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Est. Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-900">
                  {lead.propertyAddress}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {lead.ownerName}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      lead.opportunityScore >= 80
                        ? "bg-green-100 text-green-700"
                        : lead.opportunityScore >= 60
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {lead.opportunityScore}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge className={stageBadgeColor[lead.stage] || "bg-slate-100"}>
                    {lead.stage}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
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
