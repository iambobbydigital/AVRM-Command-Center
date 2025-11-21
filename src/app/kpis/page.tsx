"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPIAreaChart, TargetComparison } from "@/components/kpi-chart";
import { MetricGrid } from "@/components/metric-grid";

// Placeholder data
const revenueData = [
  { date: "Jan", value: 18500 },
  { date: "Feb", value: 21000 },
  { date: "Mar", value: 19800 },
  { date: "Apr", value: 24500 },
  { date: "May", value: 22300 },
  { date: "Jun", value: 26800 },
];

const kpisByFunction = {
  marketing: {
    metrics: [
      { title: "Leads Generated", value: 247, target: 300, change: 12, status: "warning" as const },
      { title: "Response Rate", value: "7.2%", target: "10%", change: -5, status: "warning" as const },
      { title: "Meetings Booked", value: 11, target: 12, change: 22, status: "good" as const },
      { title: "Cost per Lead", value: "$12.50", target: "$15", change: -8, status: "good" as const },
    ],
    targets: [
      { name: "Lead Generation", value: 247, target: 300 },
      { name: "Response Rate", value: 7.2, target: 10 },
      { name: "Meetings Booked", value: 11, target: 12 },
    ],
  },
  sales: {
    metrics: [
      { title: "Conversion Rate", value: "28%", target: "30%", change: 5, status: "good" as const },
      { title: "Contracts Signed", value: 3, target: 4, change: 50, status: "good" as const },
      { title: "Avg Deal Size", value: "$7,200", target: "$6,500", change: 10, status: "good" as const },
      { title: "Sales Cycle", value: "21 days", target: "30 days", change: -15, status: "good" as const },
    ],
    targets: [
      { name: "Conversion Rate", value: 28, target: 30 },
      { name: "Contracts Signed", value: 3, target: 4 },
      { name: "Deal Size", value: 7200, target: 6500 },
    ],
  },
  hosting: {
    metrics: [
      { title: "Avg Occupancy", value: "68%", target: "75%", change: -3, status: "warning" as const },
      { title: "Avg Review Score", value: "4.82", target: "4.80", change: 1, status: "good" as const },
      { title: "Response Time", value: "42 min", target: "60 min", change: -12, status: "good" as const },
      { title: "5-Star Reviews", value: "87%", target: "85%", change: 4, status: "good" as const },
    ],
    targets: [
      { name: "Occupancy", value: 68, target: 75 },
      { name: "Review Score", value: 96, target: 96 },
      { name: "Response Time", value: 70, target: 100 },
    ],
  },
  finance: {
    metrics: [
      { title: "Monthly Revenue", value: "$24,500", target: "$30,000", change: 8, status: "warning" as const },
      { title: "Gross Margin", value: "78%", target: "75%", change: 2, status: "good" as const },
      { title: "Net Margin", value: "42%", target: "40%", change: 5, status: "good" as const },
      { title: "ARR", value: "$294K", target: "$360K", change: 8, status: "warning" as const },
    ],
    targets: [
      { name: "Monthly Revenue", value: 24500, target: 30000 },
      { name: "Gross Margin", value: 78, target: 75 },
      { name: "Net Margin", value: 42, target: 40 },
    ],
  },
};

export default function KPIsPage() {
  const [activeTab, setActiveTab] = useState("marketing");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">KPI Dashboard</h2>
        <p className="text-slate-500">Track performance across all business functions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="hosting">Hosting</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        {Object.entries(kpisByFunction).map(([key, data]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <MetricGrid metrics={data.metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <KPIAreaChart
                title="Revenue Trend"
                data={revenueData}
                valueFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
              />
              <TargetComparison
                title="Target Achievement"
                items={data.targets}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
