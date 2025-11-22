import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";
import { fetchGHL } from "@/lib/api-clients";
import type { PipelineFunnelStage, ApiResponse, Listing } from "@/types";

export async function GET() {
  try {
    // Fetch Airtable metrics for pre-pipeline stages
    const airtableResponse = await fetchAirtable("Listings", {
      maxRecords: 10000,
      fields: [
        "Address Verification Status",
        "GoHighLevel Export Status",
        "Annual Revenue Gap"
      ]
    });

    const listings: Listing[] = airtableResponse.records;

    // Calculate Airtable stage counts
    const addressVerified = listings.filter(
      (l) => l.fields["Address Verification Status"] === "Verified"
    );
    const exported = listings.filter(
      (l) => l.fields["GoHighLevel Export Status"] === "Exported"
    );

    // Calculate total value for pre-pipeline stages
    const addressVerifiedValue = addressVerified.reduce(
      (sum, l) => sum + (l.fields["Annual Revenue Gap"] || 0),
      0
    );
    const exportedValue = exported.reduce(
      (sum, l) => sum + (l.fields["Annual Revenue Gap"] || 0),
      0
    );

    // Fetch GHL opportunities
    // Note: You'll need to implement fetchGHL to get opportunities by pipeline stage
    // For now, using placeholder counts
    const ghlStages = {
      "New Lead": 45,
      "Hot Lead": 28,
      "Booked Meeting": 12,
      "No-Show": 3,
      "Delayed": 8,
      "Closed": 5,
      "Non-Responsive": 15
    };

    // Build funnel stages
    const stages: PipelineFunnelStage[] = [
      {
        name: "Address Verified",
        count: addressVerified.length,
        value: `$${Math.round(addressVerifiedValue / 1000)}K`,
        color: "#3b82f6" // blue
      },
      {
        name: "Exported",
        count: exported.length,
        value: `$${Math.round(exportedValue / 1000)}K`,
        color: "#10b981" // green
      },
      {
        name: "New Lead",
        count: ghlStages["New Lead"],
        value: "$315K", // TODO: Calculate from GHL
        color: "#8b5cf6" // purple
      },
      {
        name: "Hot Lead",
        count: ghlStages["Hot Lead"],
        value: "$196K",
        color: "#f59e0b" // amber
      },
      {
        name: "Booked Meeting",
        count: ghlStages["Booked Meeting"],
        value: "$84K",
        color: "#14b8a6" // teal
      },
      {
        name: "Delayed",
        count: ghlStages["Delayed"],
        value: "$56K",
        color: "#6366f1" // indigo
      },
      {
        name: "Closed",
        count: ghlStages["Closed"],
        value: "$35K",
        color: "#22c55e" // success green
      }
    ];

    const result: ApiResponse<PipelineFunnelStage[]> = {
      data: stages,
      success: true
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pipeline funnel:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch pipeline",
      success: false
    };

    return NextResponse.json(result, { status: 500 });
  }
}
