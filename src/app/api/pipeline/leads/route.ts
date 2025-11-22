import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";
import type { Lead, Listing, Owner, ApiResponse } from "@/types";

export async function GET() {
  try {
    // Fetch top 100 listings sorted by Opportunity Score
    const response = await fetchAirtable("Listings", {
      maxRecords: 100,
      sort: [{ field: "Overall Opportunity Score", direction: "desc" }],
      fields: [
        "Listing ID",
        "Address Verified",
        "Overall Opportunity Score",
        "Annual Revenue Gap",
        "GoHighLevel Export Status",
        "Owner Contact"
      ]
    });

    const listings: Listing[] = response.records;

    // Transform to Lead format
    const leads: Lead[] = listings.map((listing) => {
      // Determine stage based on status fields
      let stage = "Pending";
      if (listing.fields["GoHighLevel Export Status"] === "Exported") {
        stage = "Exported";
      } else if (listing.fields["Address Verification Status"] === "Verified") {
        stage = "Verified";
      }

      return {
        id: listing.id,
        propertyAddress: listing.fields["Address Verified"] || "Unknown",
        ownerName: "Owner", // TODO: Lookup from Owner Contact relationship
        opportunityScore: listing.fields["Overall Opportunity Score"] || 0,
        stage,
        estimatedValue: `$${Math.round(
          (listing.fields["Annual Revenue Gap"] || 0) / 12
        )}/mo`
      };
    });

    const result: ApiResponse<Lead[]> = {
      data: leads,
      success: true
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pipeline leads:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch leads",
      success: false
    };

    return NextResponse.json(result, { status: 500 });
  }
}
