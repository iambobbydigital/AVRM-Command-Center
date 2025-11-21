import { NextResponse } from "next/server";
import { fetchHostaway } from "@/lib/api-clients";

export async function GET() {
  try {
    const data = await fetchHostaway("/listings");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Hostaway properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
