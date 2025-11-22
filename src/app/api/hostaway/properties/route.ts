import { NextResponse } from "next/server";
import { fetchHostaway } from "@/lib/api-clients";
import { createClient } from "@/lib/supabase";
import type { HostawayListing, ApiResponse } from "@/types";

// GET: Fetch all properties with filter settings
export async function GET() {
  try {
    const supabase = createClient();

    // Fetch properties from Hostaway
    const hostawayData = await fetchHostaway("/listings");
    const listings: HostawayListing[] = hostawayData.result || [];

    // Fetch filter settings from Supabase
    const { data: settings, error } = await supabase
      .from("hostaway_properties")
      .select("id, name, include_in_metrics");

    if (error && error.code !== "PGRST116") {
      // Ignore "no rows" error
      throw error;
    }

    const settingsMap = new Map(
      (settings || []).map((s) => [s.id.toString(), s.include_in_metrics])
    );

    // Merge Hostaway data with filter settings
    const propertiesWithSettings = listings.map((listing) => ({
      id: listing.id.toString(),
      name: listing.name || listing.internalListingName,
      isActive: listing.isActive,
      includeInMetrics: settingsMap.get(listing.id.toString()) ?? true, // Default: include
    }));

    const result: ApiResponse<typeof propertiesWithSettings> = {
      data: propertiesWithSettings,
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching Hostaway properties:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch properties",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}

// PUT: Update property filter setting
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { propertyId, includeInMetrics } = body;

    if (!propertyId || typeof includeInMetrics !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body", success: false },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Upsert property filter setting
    const { error } = await supabase
      .from("hostaway_properties")
      .upsert(
        {
          id: propertyId,
          name: body.propertyName || "Unknown",
          include_in_metrics: includeInMetrics,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) throw error;

    const result: ApiResponse<{ success: boolean }> = {
      data: { success: true },
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating property filter:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to update filter",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
