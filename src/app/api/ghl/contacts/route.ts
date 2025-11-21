import { NextResponse } from "next/server";
import { fetchGHL } from "@/lib/api-clients";

export async function GET() {
  try {
    const locationId = process.env.GHL_LOCATION_ID;
    const data = await fetchGHL(`/contacts/?locationId=${locationId}&limit=100`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GHL contacts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
