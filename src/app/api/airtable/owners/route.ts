import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";

export async function GET() {
  try {
    const data = await fetchAirtable("Owners", {
      maxRecords: 100,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Airtable owners error:", error);
    return NextResponse.json(
      { error: "Failed to fetch owners" },
      { status: 500 }
    );
  }
}
