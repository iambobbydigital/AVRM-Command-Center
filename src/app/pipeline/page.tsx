"use client";

import { useEffect, useState } from "react";
import { PipelineFunnel } from "@/components/pipeline-funnel";
import { LeadTable } from "@/components/lead-table";
import type { PipelineFunnelStage, Lead } from "@/types";

export default function PipelinePage() {
  const [funnelStages, setFunnelStages] = useState<PipelineFunnelStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch funnel data
        const funnelRes = await fetch("/api/pipeline/funnel");
        const funnelData = await funnelRes.json();
        if (funnelData.success) {
          setFunnelStages(funnelData.data);
        }

        // Fetch leads data
        const leadsRes = await fetch("/api/pipeline/leads");
        const leadsData = await leadsRes.json();
        if (leadsData.success) {
          setLeads(leadsData.data);
        }
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-neutral-400">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Sales Pipeline</h2>
        <p className="text-neutral-400">Lead progression from verification to signed contracts</p>
      </div>

      <PipelineFunnel stages={funnelStages} />
      <LeadTable leads={leads} />
    </div>
  );
}
