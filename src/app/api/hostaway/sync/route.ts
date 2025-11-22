import { NextResponse } from "next/server";
import { fetchHostaway } from "@/lib/api-clients";
import { createClient } from "@/lib/supabase";
import type { HostawayListing, ApiResponse } from "@/types";

// POST: Sync Hostaway properties to Supabase (creates missing records)
export async function POST() {
  try {
    const supabase = createClient();

    // Fetch all properties from Hostaway
    const hostawayData = await fetchHostaway("/listings");
    const listings: HostawayListing[] = hostawayData.result || [];

    // Upsert all properties to Supabase
    const upserts = listings.map((listing) => ({
      id: listing.id.toString(),
      name: listing.name || listing.internalListingName,
      include_in_metrics: true, // Default to included
      last_synced: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("hostaway_properties")
      .upsert(upserts, { onConflict: "id", ignoreDuplicates: false });

    if (error) throw error;

    const result: ApiResponse<{ syncedCount: number }> = {
      data: { syncedCount: upserts.length },
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error syncing Hostaway properties:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to sync properties",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
