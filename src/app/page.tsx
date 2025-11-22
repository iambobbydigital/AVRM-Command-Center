"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metric, EnrichmentMetrics, HostingMetrics } from "@/types";

export default function DashboardPage() {
  const [enrichment, setEnrichment] = useState<EnrichmentMetrics | null>(null);
  const [hosting, setHosting] = useState<HostingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Airtable enrichment metrics
        const enrichmentRes = await fetch("/api/airtable/enrichment");
        const enrichmentData = await enrichmentRes.json();
        if (enrichmentData.success) {
          setEnrichment(enrichmentData.data);
        }

        // Fetch Hostaway hosting metrics
        const hostingRes = await fetch("/api/hostaway/metrics");
        const hostingData = await hostingRes.json();
        if (hostingData.success) {
          setHosting(hostingData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-neutral-400">Loading dashboard...</div>
      </div>
    );
  }

  const metrics: Metric[] = [
    {
      title: "Total Listings",
      value: enrichment?.totalListings || 0,
      status: "good",
    },
    {
      title: "Address Verified",
      value: `${enrichment?.verificationCompletionPercent || 0}%`,
      target: "100%",
      change: enrichment?.addressVerified || 0,
      status: (enrichment?.verificationCompletionPercent || 0) >= 80 ? "good" : "warning",
    },
    {
      title: "Exported to GHL",
      value: enrichment?.totalExported || 0,
      target: enrichment?.totalListings || 0,
      change: enrichment?.exportRatePercent || 0,
      status: (enrichment?.exportRatePercent || 0) >= 50 ? "good" : "warning",
    },
    {
      title: "Active Properties",
      value: hosting?.activeProperties || 0,
      status: "good",
    },
    {
      title: "Monthly Revenue",
      value: `$${Math.round((hosting?.totalPmCommission || 0) / 12).toLocaleString()}`,
      target: "$10,000",
      status: "good",
    },
    {
      title: "Avg Occupancy",
      value: `${Math.round((hosting?.avgOccupancy || 0) * 100)}%`,
      target: "70%",
      status: (hosting?.avgOccupancy || 0) >= 0.7 ? "good" : "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-neutral-400">Live metrics from Airtable, GoHighLevel, and Hostaway</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-6 bg-neutral-900 border-neutral-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">{metric.title}</p>
                {metric.status && (
                  <Badge
                    className={
                      metric.status === "good"
                        ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                        : metric.status === "warning"
                        ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        : "border-red-500/50 text-red-400 bg-red-500/10"
                    }
                  >
                    {metric.status}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
              {metric.target && (
                <p className="text-sm text-neutral-500">Target: {metric.target}</p>
              )}
              {metric.change !== undefined && (
                <p className="text-sm text-neutral-500">
                  {typeof metric.change === "number" && metric.change > 0 ? "+" : ""}
                  {metric.change}
                  {typeof metric.change === "number" ? "%" : ""}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">Address Verification Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Verified</span>
              <span className="text-emerald-400">{enrichment?.addressVerified || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Not Found</span>
              <span className="text-red-400">{enrichment?.addressNotFound || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Pending</span>
              <span className="text-amber-400">{enrichment?.addressPending || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">Hosting Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Total Bookings (TTM)</span>
              <span className="text-white">{hosting?.totalBookings || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Revenue (TTM)</span>
              <span className="text-white">
                ${Math.round(hosting?.totalPmCommission || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Avg Review Score</span>
              <span className="text-white">{hosting?.avgReviewScore.toFixed(1) || "N/A"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
