import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Only allow in non-production or with secret key
  const debugKey = process.env.DEBUG_KEY;
  const url = new URL(request.url);
  const providedKey = url.searchParams.get("key");

  if (process.env.NODE_ENV === "production" && debugKey !== providedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envInfo = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,

    // Check which vars exist (without exposing values)
    supabase: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    },
    hostaway: {
      HOSTAWAY_API_KEY: !!process.env.HOSTAWAY_API_KEY,
      HOSTAWAY_ACCOUNT_ID: !!process.env.HOSTAWAY_ACCOUNT_ID,
    },
    airtable: {
      AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID,
    },
    ghl: {
      GHL_API_KEY: !!process.env.GHL_API_KEY,
      GHL_LOCATION_ID: !!process.env.GHL_LOCATION_ID,
    },
    postgres: {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_USER: !!process.env.POSTGRES_USER,
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,
      POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
      POSTGRES_DATABASE: !!process.env.POSTGRES_DATABASE,
    },

    // Show all env var keys (not values) that contain these strings
    allSupabaseKeys: Object.keys(process.env).filter(k => k.includes("SUPABASE")),
    allHostawayKeys: Object.keys(process.env).filter(k => k.includes("HOSTAWAY")),
    allPostgresKeys: Object.keys(process.env).filter(k => k.includes("POSTGRES")),
    allAirtableKeys: Object.keys(process.env).filter(k => k.includes("AIRTABLE")),
    allGHLKeys: Object.keys(process.env).filter(k => k.includes("GHL")),
  };

  return NextResponse.json(envInfo);
}
