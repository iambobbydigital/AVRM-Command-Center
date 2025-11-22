import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";
import type { Listing, EnrichmentMetrics, ApiResponse } from "@/types";

export async function GET() {
  try {
    // Fetch ALL listings (no filter) to count totals
    const response = await fetchAirtable("Listings", {
      maxRecords: 10000, // Adjust if you have more
      fields: [
        "Address Verification Status",
        "GoHighLevel Export Status",
        "Export Date"
      ]
    });

    const listings: Listing[] = response.records;

    // Calculate metrics
    const totalListings = listings.length;

    const addressVerified = listings.filter(
      (l) => l.fields["Address Verification Status"] === "Verified"
    ).length;

    const addressNotFound = listings.filter(
      (l) => l.fields["Address Verification Status"] === "Not Found"
    ).length;

    const addressPending = listings.filter(
      (l) => !l.fields["Address Verification Status"] ||
             l.fields["Address Verification Status"] === "Unverified"
    ).length;

    const verificationCompletionPercent = totalListings > 0
      ? Math.round((addressVerified / totalListings) * 100)
      : 0;

    const totalExported = listings.filter(
      (l) => l.fields["GoHighLevel Export Status"] === "Exported"
    ).length;

    const exportRatePercent = totalListings > 0
      ? Math.round((totalExported / totalListings) * 100)
      : 0;

    const metrics: EnrichmentMetrics = {
      totalListings,
      addressVerified,
      addressNotFound,
      addressPending,
      verificationCompletionPercent,
      totalExported,
      exportRatePercent
    };

    const result: ApiResponse<EnrichmentMetrics> = {
      data: metrics,
      success: true
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching enrichment metrics:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch enrichment metrics",
      success: false
    };

    return NextResponse.json(result, { status: 500 });
  }
}
