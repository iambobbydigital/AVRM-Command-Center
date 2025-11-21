import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";

export async function GET() {
  try {
    const data = await fetchAirtable("Listings", {
      maxRecords: 100,
      sort: [{ field: "Overall Opportunity Score", direction: "desc" }],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Airtable listings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
