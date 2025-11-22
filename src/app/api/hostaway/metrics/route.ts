import { NextResponse } from "next/server";
import { fetchHostaway } from "@/lib/api-clients";
import { createClient } from "@/lib/supabase";
import type { HostawayReservation, HostingMetrics, PropertyMetrics, ApiResponse } from "@/types";

export const revalidate = 21600; // Cache for 6 hours

export async function GET() {
  try {
    const supabase = createClient();

    // Get filter settings (which properties to include)
    const { data: propertySettings } = await supabase
      .from("hostaway_properties")
      .select("id, name, include_in_metrics");

    const includedPropertyIds = new Set(
      (propertySettings || [])
        .filter((p) => p.include_in_metrics)
        .map((p) => p.id)
    );

    // Fetch reservations for last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const reservationsData = await fetchHostaway(
      `/reservations?arrivalStartDate=${oneYearAgo.toISOString().split("T")[0]}`
    );
    const allReservations: HostawayReservation[] = reservationsData.result || [];

    // Filter reservations to only included properties
    const reservations = allReservations.filter((r) =>
      includedPropertyIds.has(r.listingId.toString())
    );

    // Calculate metrics per property
    const propertyMetricsMap = new Map<string, PropertyMetrics>();

    reservations.forEach((res) => {
      const propId = res.listingId.toString();

      if (!propertyMetricsMap.has(propId)) {
        propertyMetricsMap.set(propId, {
          propertyId: propId,
          propertyName: res.listingName,
          pmCommission: 0,
          occupancyRate: 0,
          bookingsCount: 0,
          avgNightlyRate: 0,
          avgReviewRating: 0,
          includeInMetrics: true,
        });
      }

      const metrics = propertyMetricsMap.get(propId)!;

      if (res.status === "confirmed") {
        metrics.pmCommission += res.pmCommissionAmount;
        metrics.bookingsCount += 1;
        metrics.avgNightlyRate += res.totalPrice / res.nights;
      }
    });

    // Calculate averages
    const properties = Array.from(propertyMetricsMap.values()).map((p) => ({
      ...p,
      avgNightlyRate: p.bookingsCount > 0 ? p.avgNightlyRate / p.bookingsCount : 0,
      occupancyRate: 0, // TODO: Calculate from available nights
      avgReviewRating: 0, // TODO: Fetch from reviews API
    }));

    // Aggregate totals
    const totalPmCommission = properties.reduce((sum, p) => sum + p.pmCommission, 0);
    const avgOccupancy = properties.length > 0
      ? properties.reduce((sum, p) => sum + p.occupancyRate, 0) / properties.length
      : 0;
    const avgReviewScore = properties.length > 0
      ? properties.reduce((sum, p) => sum + p.avgReviewRating, 0) / properties.length
      : 0;

    const metrics: HostingMetrics = {
      activeProperties: properties.length,
      totalPmCommission,
      avgOccupancy,
      avgReviewScore,
      totalBookings: reservations.filter((r) => r.status === "confirmed").length,
      properties,
    };

    const result: ApiResponse<HostingMetrics> = {
      data: metrics,
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching Hostaway metrics:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch metrics",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
