import { PipelineFunnel } from "@/components/pipeline-funnel";
import { LeadTable } from "@/components/lead-table";

// Placeholder data - will be replaced with API calls
const pipelineStages = [
  { name: "Leads", count: 247, value: "$741K", color: "#64748b" },
  { name: "Qualified", count: 89, value: "$267K", color: "#3b82f6" },
  { name: "Meeting Booked", count: 23, value: "$69K", color: "#8b5cf6" },
  { name: "Proposal Sent", count: 12, value: "$36K", color: "#f97316" },
  { name: "Signed", count: 4, value: "$12K", color: "#22c55e" },
];

const topLeads = [
  {
    id: "1",
    propertyAddress: "123 Mountain View Dr, Woodstock, NY",
    ownerName: "John Smith",
    opportunityScore: 92,
    stage: "Meeting",
    estimatedValue: "$8,500/yr",
  },
  {
    id: "2",
    propertyAddress: "456 Lake Shore Rd, Windham, NY",
    ownerName: "Sarah Johnson",
    opportunityScore: 88,
    stage: "Qualified",
    estimatedValue: "$12,000/yr",
  },
  {
    id: "3",
    propertyAddress: "789 Forest Lane, Phoenicia, NY",
    ownerName: "Michael Chen",
    opportunityScore: 85,
    stage: "Proposal",
    estimatedValue: "$6,200/yr",
  },
  {
    id: "4",
    propertyAddress: "321 Creek View, Hunter, NY",
    ownerName: "Emily Davis",
    opportunityScore: 82,
    stage: "Lead",
    estimatedValue: "$9,800/yr",
  },
  {
    id: "5",
    propertyAddress: "654 Summit Rd, Tannersville, NY",
    ownerName: "Robert Wilson",
    opportunityScore: 79,
    stage: "Qualified",
    estimatedValue: "$7,500/yr",
  },
];

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Lead Pipeline</h2>
        <p className="text-slate-500">
          Track leads from discovery to signed contracts
        </p>
      </div>

      <PipelineFunnel stages={pipelineStages} />

      <LeadTable leads={topLeads} />
    </div>
  );
}
