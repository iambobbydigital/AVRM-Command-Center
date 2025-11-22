import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// GET: Fetch TTM revenue (delegates to Hostaway metrics)
export async function GET() {
  try {
    // Fetch from Hostaway metrics API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/hostaway/metrics`, {
      next: { revalidate: 21600 }, // 6 hours
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Hostaway metrics");
    }

    const hostawayData = await response.json();

    if (!hostawayData.success) {
      throw new Error(hostawayData.error || "Hostaway API error");
    }

    const metrics = hostawayData.data;

    // Revenue = total pmCommission
    const result: ApiResponse<any> = {
      data: {
        ttmRevenue: metrics.totalPmCommission,
        monthlyAvg: metrics.totalPmCommission / 12,
        propertyCount: metrics.activeProperties,
      },
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching revenue:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch revenue",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
