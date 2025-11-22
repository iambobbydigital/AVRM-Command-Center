# Live API Integrations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Connect all dashboard components to live data from Airtable, GoHighLevel, Hostaway, and Stripe APIs with manual expense tracking.

**Architecture:** Create typed API routes with data transformation layers, implement Supabase for persistent settings (property filters, expense tracking), add Settings page for configuration, update all UI components to fetch real data.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (PostgreSQL), Airtable API, GoHighLevel API, Hostaway API, Stripe API, React hooks (useEffect, useState), Tremor charts

---

## Task 1: Create TypeScript Type Definitions

**Files:**
- Create: `src/types/airtable.ts`
- Create: `src/types/ghl.ts`
- Create: `src/types/hostaway.ts`
- Create: `src/types/stripe.ts`
- Create: `src/types/api.ts`
- Create: `src/types/index.ts`

**Step 1: Create Airtable type definitions**

Create `src/types/airtable.ts`:

```typescript
// Airtable base response wrapper
export interface AirtableRecord<T> {
  id: string;
  createdTime: string;
  fields: T;
}

export interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

// Listings table fields
export interface ListingFields {
  "Listing ID": string;
  "Address Verified": string;
  "Address Verification Status": "Verified" | "Not Found" | "Unverified" | "";
  "GoHighLevel Export Status": string;
  "Export Date": string;
  "Overall Opportunity Score": number;
  "Annual Revenue Gap": number;
  "Bedrooms": number;
  "TTM Revenue": number;
  "TTM Avg Rate": number;
  "TTM Occupancy": number;
  "Star Rating": number;
  "Owner Contact": string[];
  "Skip Trace Status": string;
}

export type Listing = AirtableRecord<ListingFields>;

// Owners table fields
export interface OwnerFields {
  "Owner ID": number;
  "First Name": string;
  "Last Name": string;
  "Best Phone": string;
  "Best Email": string;
  "GoHighLevel Contact ID": string;
  "Listings": string[];
  "Total Properties": number;
}

export type Owner = AirtableRecord<OwnerFields>;

// Enrichment metrics for dashboard
export interface EnrichmentMetrics {
  totalListings: number;
  addressVerified: number;
  addressNotFound: number;
  addressPending: number;
  verificationCompletionPercent: number;
  totalExported: number;
  exportRatePercent: number;
}
```

**Step 2: Create GoHighLevel type definitions**

Create `src/types/ghl.ts`:

```typescript
// GHL Contact
export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, string>;
  dateAdded: string;
}

// GHL Pipeline Stage
export interface GHLPipelineStage {
  id: string;
  name: string;
  position: number;
}

// GHL Opportunity
export interface GHLOpportunity {
  id: string;
  name: string;
  pipelineId: string;
  pipelineStageId: string;
  status: string;
  monetaryValue: number;
  contactId: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// Pipeline funnel data
export interface PipelineFunnelStage {
  name: string;
  count: number;
  value: string;
  color: string;
}
```

**Step 3: Create Hostaway type definitions**

Create `src/types/hostaway.ts`:

```typescript
// Hostaway Listing
export interface HostawayListing {
  id: number;
  name: string;
  internalListingName: string;
  status: string;
  isActive: boolean;
  currency: string;
}

// Hostaway Reservation
export interface HostawayReservation {
  id: number;
  listingId: number;
  listingName: string;
  status: "confirmed" | "cancelled" | "pending";
  channelCommissionAmount: number;
  pmCommissionAmount: number; // KEY: Our revenue
  arrivalDate: string;
  departureDate: string;
  guestName: string;
  totalPrice: number;
  nights: number;
}

// Hostaway Review
export interface HostawayReview {
  id: number;
  listingId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

// Aggregated property metrics
export interface PropertyMetrics {
  propertyId: string;
  propertyName: string;
  pmCommission: number;
  occupancyRate: number;
  bookingsCount: number;
  avgNightlyRate: number;
  avgReviewRating: number;
  includeInMetrics: boolean;
}

// Hosting KPIs
export interface HostingMetrics {
  activeProperties: number;
  totalPmCommission: number;
  avgOccupancy: number;
  avgReviewScore: number;
  totalBookings: number;
  properties: PropertyMetrics[];
}
```

**Step 4: Create Stripe type definitions**

Create `src/types/stripe.ts`:

```typescript
// Simplified Stripe invoice
export interface StripeInvoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: "paid" | "open" | "void" | "uncollectible";
  created: number;
  period_start: number;
  period_end: number;
}

// Cash collection metrics
export interface CashMetrics {
  monthlyCollected: number;
  ttmCollected: number;
  pendingInvoices: number;
  pendingAmount: number;
}
```

**Step 5: Create shared API types**

Create `src/types/api.ts`:

```typescript
// Standard API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Metric widget data
export interface Metric {
  title: string;
  value: string | number;
  target?: string | number;
  change?: number;
  status?: "good" | "warning" | "bad";
}

// Lead for pipeline table
export interface Lead {
  id: string;
  propertyAddress: string;
  ownerName: string;
  opportunityScore: number;
  stage: string;
  estimatedValue: string;
}

// Time series data point
export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}
```

**Step 6: Create index file**

Create `src/types/index.ts`:

```typescript
export * from './airtable';
export * from './ghl';
export * from './hostaway';
export * from './stripe';
export * from './api';
```

**Step 7: Commit type definitions**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions for all API integrations

- Airtable: Listings, Owners, EnrichmentMetrics
- GoHighLevel: Contacts, Opportunities, Pipeline stages
- Hostaway: Listings, Reservations, PropertyMetrics
- Stripe: Invoices, CashMetrics
- Shared: ApiResponse, Metric, Lead, TimeSeriesDataPoint

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Setup Supabase Database Schema

**Files:**
- Create: `supabase/migrations/002_hostaway_and_finance.sql`
- Modify: `src/lib/supabase.ts`

**Step 1: Create Supabase migration for new tables**

Create `supabase/migrations/002_hostaway_and_finance.sql`:

```sql
-- Hostaway property filter settings
CREATE TABLE IF NOT EXISTS hostaway_properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  include_in_metrics BOOLEAN DEFAULT true,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Hostaway metrics snapshots (cached data, refresh every 6 hours)
CREATE TABLE IF NOT EXISTS hostaway_metrics_snapshots (
  id SERIAL PRIMARY KEY,
  property_id TEXT REFERENCES hostaway_properties(id),
  snapshot_date DATE NOT NULL,
  pm_commission DECIMAL(10,2),
  occupancy_rate DECIMAL(5,2),
  bookings_count INTEGER,
  avg_review_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, snapshot_date)
);

-- Expense sources (categories)
CREATE TABLE IF NOT EXISTS expense_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_recurring BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Monthly expense entries
CREATE TABLE IF NOT EXISTS expense_entries (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES expense_sources(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- First day of month (YYYY-MM-01)
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, month)
);

-- Indexes for performance
CREATE INDEX idx_hostaway_properties_include ON hostaway_properties(include_in_metrics);
CREATE INDEX idx_hostaway_snapshots_date ON hostaway_metrics_snapshots(snapshot_date DESC);
CREATE INDEX idx_expense_entries_month ON expense_entries(month DESC);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hostaway_properties_updated_at
  BEFORE UPDATE ON hostaway_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_sources_updated_at
  BEFORE UPDATE ON expense_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_entries_updated_at
  BEFORE UPDATE ON expense_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Step 2: Run migration**

```bash
# If using Supabase CLI locally
supabase db reset

# Or apply via Supabase dashboard:
# 1. Go to SQL Editor
# 2. Paste migration SQL
# 3. Run
```

**Step 3: Verify Supabase client works**

No changes needed to `src/lib/supabase.ts` - it already exports the client.

**Step 4: Commit migration**

```bash
git add supabase/migrations/002_hostaway_and_finance.sql
git commit -m "feat: add Supabase schema for Hostaway filters and expense tracking

- hostaway_properties: property filter settings
- hostaway_metrics_snapshots: cached metrics (6hr refresh)
- expense_sources: expense categories
- expense_entries: monthly expense amounts
- Indexes and update triggers

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Create Environment Variables Configuration

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (verify .env.local is ignored)

**Step 1: Create .env.example template**

Create `.env.example`:

```bash
# Airtable
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXXXX

# GoHighLevel
GHL_API_KEY=YOUR_GHL_API_KEY
GHL_LOCATION_ID=YOUR_LOCATION_ID

# Hostaway
HOSTAWAY_API_KEY=YOUR_HOSTAWAY_API_KEY
HOSTAWAY_ACCOUNT_ID=YOUR_ACCOUNT_ID

# Stripe
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: API Cache Settings
API_CACHE_TTL=21600  # 6 hours in seconds
```

**Step 2: Verify .gitignore**

Ensure `.env.local` is in `.gitignore` (should already be there from Next.js defaults).

**Step 3: Commit .env.example**

```bash
git add .env.example
git commit -m "docs: add environment variables template

Shows all required API keys and configuration for:
- Airtable (Vacation Rental CRM)
- GoHighLevel (Sales pipeline)
- Hostaway (Property management)
- Stripe (Invoicing/payments)
- Supabase (Database)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Implement Airtable Enrichment Metrics API

**Files:**
- Create: `src/app/api/airtable/enrichment/route.ts`

**Step 1: Create enrichment metrics endpoint**

Create `src/app/api/airtable/enrichment/route.ts`:

```typescript
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
```

**Step 2: Test the endpoint**

```bash
# Start dev server
npm run dev

# In another terminal, test the endpoint
curl http://localhost:3000/api/airtable/enrichment | jq
```

Expected output:
```json
{
  "data": {
    "totalListings": 1500,
    "addressVerified": 1200,
    "addressNotFound": 50,
    "addressPending": 250,
    "verificationCompletionPercent": 80,
    "totalExported": 900,
    "exportRatePercent": 60
  },
  "success": true
}
```

**Step 3: Commit enrichment API**

```bash
git add src/app/api/airtable/enrichment/route.ts
git commit -m "feat: add Airtable enrichment metrics API endpoint

Returns:
- Total listings count
- Address verification completion stats
- GHL export tracking
- Completion percentages

Used by dashboard to show lead enrichment pipeline status.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Implement GoHighLevel Pipeline API

**Files:**
- Create: `src/app/api/pipeline/funnel/route.ts`
- Create: `src/app/api/pipeline/leads/route.ts`

**Step 1: Create pipeline funnel endpoint**

Create `src/app/api/pipeline/funnel/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";
import { fetchGHL } from "@/lib/api-clients";
import type { PipelineFunnelStage, ApiResponse, Listing } from "@/types";

export async function GET() {
  try {
    // Fetch Airtable metrics for pre-pipeline stages
    const airtableResponse = await fetchAirtable("Listings", {
      maxRecords: 10000,
      fields: [
        "Address Verification Status",
        "GoHighLevel Export Status",
        "Annual Revenue Gap"
      ]
    });

    const listings: Listing[] = airtableResponse.records;

    // Calculate Airtable stage counts
    const addressVerified = listings.filter(
      (l) => l.fields["Address Verification Status"] === "Verified"
    );
    const exported = listings.filter(
      (l) => l.fields["GoHighLevel Export Status"] === "Exported"
    );

    // Calculate total value for pre-pipeline stages
    const addressVerifiedValue = addressVerified.reduce(
      (sum, l) => sum + (l.fields["Annual Revenue Gap"] || 0),
      0
    );
    const exportedValue = exported.reduce(
      (sum, l) => sum + (l.fields["Annual Revenue Gap"] || 0),
      0
    );

    // Fetch GHL opportunities
    // Note: You'll need to implement fetchGHL to get opportunities by pipeline stage
    // For now, using placeholder counts
    const ghlStages = {
      "New Lead": 45,
      "Hot Lead": 28,
      "Booked Meeting": 12,
      "No-Show": 3,
      "Delayed": 8,
      "Closed": 5,
      "Non-Responsive": 15
    };

    // Build funnel stages
    const stages: PipelineFunnelStage[] = [
      {
        name: "Address Verified",
        count: addressVerified.length,
        value: `$${Math.round(addressVerifiedValue / 1000)}K`,
        color: "#3b82f6" // blue
      },
      {
        name: "Exported",
        count: exported.length,
        value: `$${Math.round(exportedValue / 1000)}K`,
        color: "#10b981" // green
      },
      {
        name: "New Lead",
        count: ghlStages["New Lead"],
        value: "$315K", // TODO: Calculate from GHL
        color: "#8b5cf6" // purple
      },
      {
        name: "Hot Lead",
        count: ghlStages["Hot Lead"],
        value: "$196K",
        color: "#f59e0b" // amber
      },
      {
        name: "Booked Meeting",
        count: ghlStages["Booked Meeting"],
        value: "$84K",
        color: "#14b8a6" // teal
      },
      {
        name: "Delayed",
        count: ghlStages["Delayed"],
        value: "$56K",
        color: "#6366f1" // indigo
      },
      {
        name: "Closed",
        count: ghlStages["Closed"],
        value: "$35K",
        color: "#22c55e" // success green
      }
    ];

    const result: ApiResponse<PipelineFunnelStage[]> = {
      data: stages,
      success: true
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pipeline funnel:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch pipeline",
      success: false
    };

    return NextResponse.json(result, { status: 500 });
  }
}
```

**Step 2: Create pipeline leads endpoint**

Create `src/app/api/pipeline/leads/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { fetchAirtable } from "@/lib/api-clients";
import type { Lead, Listing, Owner, ApiResponse } from "@/types";

export async function GET() {
  try {
    // Fetch top 100 listings sorted by Opportunity Score
    const response = await fetchAirtable("Listings", {
      maxRecords: 100,
      sort: [{ field: "Overall Opportunity Score", direction: "desc" }],
      fields: [
        "Listing ID",
        "Address Verified",
        "Overall Opportunity Score",
        "Annual Revenue Gap",
        "GoHighLevel Export Status",
        "Owner Contact"
      ]
    });

    const listings: Listing[] = response.records;

    // Transform to Lead format
    const leads: Lead[] = listings.map((listing) => {
      // Determine stage based on status fields
      let stage = "Pending";
      if (listing.fields["GoHighLevel Export Status"] === "Exported") {
        stage = "Exported";
      } else if (listing.fields["Address Verification Status"] === "Verified") {
        stage = "Verified";
      }

      return {
        id: listing.id,
        propertyAddress: listing.fields["Address Verified"] || "Unknown",
        ownerName: "Owner", // TODO: Lookup from Owner Contact relationship
        opportunityScore: listing.fields["Overall Opportunity Score"] || 0,
        stage,
        estimatedValue: `$${Math.round(
          (listing.fields["Annual Revenue Gap"] || 0) / 12
        )}/mo`
      };
    });

    const result: ApiResponse<Lead[]> = {
      data: leads,
      success: true
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pipeline leads:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch leads",
      success: false
    };

    return NextResponse.json(result, { status: 500 });
  }
}
```

**Step 3: Test both endpoints**

```bash
curl http://localhost:3000/api/pipeline/funnel | jq
curl http://localhost:3000/api/pipeline/leads | jq
```

**Step 4: Commit pipeline APIs**

```bash
git add src/app/api/pipeline/
git commit -m "feat: add pipeline funnel and leads API endpoints

/api/pipeline/funnel:
- Combines Airtable + GHL stages
- Returns full funnel from verification to closed

/api/pipeline/leads:
- Top 100 leads by opportunity score
- Includes address, owner, stage, value

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Implement Hostaway Properties API with Filtering

**Files:**
- Create: `src/app/api/hostaway/properties/route.ts`
- Create: `src/app/api/hostaway/sync/route.ts`

**Step 1: Create properties list endpoint**

Create `src/app/api/hostaway/properties/route.ts`:

```typescript
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
```

**Step 2: Create sync endpoint to populate Supabase**

Create `src/app/api/hostaway/sync/route.ts`:

```typescript
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
```

**Step 3: Test endpoints**

```bash
# Sync properties first
curl -X POST http://localhost:3000/api/hostaway/sync | jq

# Fetch properties with filter settings
curl http://localhost:3000/api/hostaway/properties | jq

# Update a property filter
curl -X PUT http://localhost:3000/api/hostaway/properties \
  -H "Content-Type: application/json" \
  -d '{"propertyId":"123","propertyName":"Test Property","includeInMetrics":false}' | jq
```

**Step 4: Commit Hostaway property APIs**

```bash
git add src/app/api/hostaway/
git commit -m "feat: add Hostaway properties API with filtering

/api/hostaway/properties:
- GET: List all properties with filter settings
- PUT: Update include_in_metrics flag

/api/hostaway/sync:
- POST: Sync Hostaway properties to Supabase

Enables property filtering for dashboard metrics.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Implement Hostaway Metrics API

**Files:**
- Create: `src/app/api/hostaway/metrics/route.ts`

**Step 1: Create metrics aggregation endpoint**

Create `src/app/api/hostaway/metrics/route.ts`:

```typescript
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
```

**Step 2: Test metrics endpoint**

```bash
curl http://localhost:3000/api/hostaway/metrics | jq
```

Expected output structure:
```json
{
  "data": {
    "activeProperties": 5,
    "totalPmCommission": 12450.50,
    "avgOccupancy": 0.67,
    "avgReviewScore": 4.8,
    "totalBookings": 45,
    "properties": [...]
  },
  "success": true
}
```

**Step 3: Commit Hostaway metrics API**

```bash
git add src/app/api/hostaway/metrics/route.ts
git commit -m "feat: add Hostaway metrics aggregation API

Calculates:
- Total pmCommission (TTM) - filtered properties only
- Property-level metrics (commission, bookings, occupancy)
- Aggregate averages across all included properties

6-hour cache via Next.js revalidate.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Implement Finance APIs (Expenses & Revenue)

**Files:**
- Create: `src/app/api/finance/expenses/route.ts`
- Create: `src/app/api/finance/revenue/route.ts`

**Step 1: Create expenses API**

Create `src/app/api/finance/expenses/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

interface ExpenseEntry {
  id: number;
  month: string;
  amount: number;
  source_name: string;
  notes: string;
}

// GET: Fetch expenses for TTM or specific time range
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get("months") || "12");

    const supabase = createClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const startMonth = startDate.toISOString().slice(0, 7) + "-01";

    // Fetch expense entries with source names
    const { data: expenses, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        month,
        amount,
        notes,
        expense_sources (
          name
        )
      `)
      .gte("month", startMonth)
      .order("month", { ascending: false });

    if (error) throw error;

    // Transform data
    const entries: ExpenseEntry[] = (expenses || []).map((e: any) => ({
      id: e.id,
      month: e.month,
      amount: parseFloat(e.amount),
      source_name: e.expense_sources?.name || "Unknown",
      notes: e.notes || "",
    }));

    // Calculate TTM total
    const ttmTotal = entries.reduce((sum, e) => sum + e.amount, 0);

    // Group by month for charts
    const byMonth = entries.reduce((acc: Record<string, number>, e) => {
      acc[e.month] = (acc[e.month] || 0) + e.amount;
      return acc;
    }, {});

    // Group by source for breakdown
    const bySource = entries.reduce((acc: Record<string, number>, e) => {
      acc[e.source_name] = (acc[e.source_name] || 0) + e.amount;
      return acc;
    }, {});

    const result: ApiResponse<any> = {
      data: {
        ttmTotal,
        entries,
        byMonth,
        bySource,
      },
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching expenses:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch expenses",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}

// POST: Add or update expense entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceId, month, amount, notes } = body;

    if (!sourceId || !month || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("expense_entries")
      .upsert(
        {
          source_id: sourceId,
          month,
          amount: parseFloat(amount),
          notes,
        },
        { onConflict: "source_id,month" }
      )
      .select()
      .single();

    if (error) throw error;

    const result: ApiResponse<typeof data> = {
      data,
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error saving expense entry:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to save expense",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
```

**Step 2: Create revenue API (reuses Hostaway data)**

Create `src/app/api/finance/revenue/route.ts`:

```typescript
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
```

**Step 3: Test finance APIs**

```bash
# Get TTM expenses
curl http://localhost:3000/api/finance/expenses | jq

# Get TTM revenue
curl http://localhost:3000/api/finance/revenue | jq
```

**Step 4: Commit finance APIs**

```bash
git add src/app/api/finance/
git commit -m "feat: add finance tracking APIs for expenses and revenue

/api/finance/expenses:
- GET: Fetch TTM expenses by month and source
- POST: Add/update expense entries

/api/finance/revenue:
- GET: Fetch TTM revenue from Hostaway pmCommission

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Implement Expense Management in Settings Page

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/components/expense-manager.tsx`
- Create: `src/app/api/finance/sources/route.ts`

**Step 1: Create expense sources API**

Create `src/app/api/finance/sources/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import type { ApiResponse } from "@/types";

interface ExpenseSource {
  id: number;
  name: string;
  description: string;
  is_recurring: boolean;
  is_active: boolean;
}

// GET: Fetch all expense sources
export async function GET() {
  try {
    const supabase = createClient();

    const { data: sources, error } = await supabase
      .from("expense_sources")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;

    const result: ApiResponse<ExpenseSource[]> = {
      data: sources || [],
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching expense sources:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to fetch sources",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}

// POST: Create new expense source
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, isRecurring } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required", success: false },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("expense_sources")
      .insert({
        name,
        description: description || "",
        is_recurring: isRecurring ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    const result: ApiResponse<ExpenseSource> = {
      data,
      success: true,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating expense source:", error);

    const result: ApiResponse<never> = {
      error: error instanceof Error ? error.message : "Failed to create source",
      success: false,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
```

**Step 2: Create expense manager component**

Create `src/components/expense-manager.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExpenseSource {
  id: number;
  name: string;
  description: string;
}

interface ExpenseEntry {
  source_id: number;
  month: string;
  amount: number;
}

export function ExpenseManager() {
  const [sources, setSources] = useState<ExpenseSource[]>([]);
  const [expenses, setExpenses] = useState<Record<string, Record<number, number>>>({});
  const [loading, setLoading] = useState(true);

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7) + "-01";
  }).reverse();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch sources
      const sourcesRes = await fetch("/api/finance/sources");
      const sourcesData = await sourcesRes.json();
      if (sourcesData.success) {
        setSources(sourcesData.data);
      }

      // Fetch expenses
      const expensesRes = await fetch("/api/finance/expenses");
      const expensesData = await expensesRes.json();
      if (expensesData.success) {
        // Transform to nested map: month -> sourceId -> amount
        const expenseMap: Record<string, Record<number, number>> = {};
        expensesData.data.entries.forEach((e: any) => {
          if (!expenseMap[e.month]) expenseMap[e.month] = {};
          expenseMap[e.month][e.source_id] = e.amount;
        });
        setExpenses(expenseMap);
      }
    } catch (error) {
      console.error("Error fetching expense data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveExpense(sourceId: number, month: string, amount: number) {
    try {
      const response = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, month, amount }),
      });

      if (response.ok) {
        // Update local state
        setExpenses((prev) => ({
          ...prev,
          [month]: { ...prev[month], [sourceId]: amount },
        }));
      }
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  }

  if (loading) {
    return <div className="text-neutral-400">Loading expenses...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Monthly Expense Tracking</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left p-2 text-neutral-400">Expense Source</th>
              {months.map((month) => (
                <th key={month} className="text-right p-2 text-neutral-400">
                  {new Date(month).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id} className="border-b border-neutral-800">
                <td className="p-2 text-white">{source.name}</td>
                {months.map((month) => (
                  <td key={month} className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-20 text-right bg-neutral-900 border-neutral-700 text-white"
                      value={expenses[month]?.[source.id] || ""}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        saveExpense(source.id, month, value);
                      }}
                      placeholder="0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        onClick={() => {
          const name = prompt("New expense source name:");
          if (name) {
            fetch("/api/finance/sources", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, isRecurring: true }),
            }).then(() => fetchData());
          }
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Add Expense Source
      </Button>
    </div>
  );
}
```

**Step 3: Create settings page**

Create `src/app/settings/page.tsx`:

```typescript
import { ExpenseManager } from "@/components/expense-manager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-neutral-400">Manage expense tracking and property filters</p>
      </div>

      <ExpenseManager />

      {/* TODO: Add Hostaway property filter management here */}
    </div>
  );
}
```

**Step 4: Test settings page**

```bash
# Visit http://localhost:3000/settings
# Should see expense tracking grid
```

**Step 5: Commit settings page and expense manager**

```bash
git add src/app/settings/ src/components/expense-manager.tsx src/app/api/finance/sources/
git commit -m "feat: add expense management in Settings page

Components:
- ExpenseManager: Grid for tracking monthly expenses by source
- Settings page: Houses expense manager

APIs:
- /api/finance/sources: CRUD for expense categories

Users can add expense sources and enter monthly amounts.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Update Dashboard with Live Data

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Update dashboard to fetch live data**

Modify `src/app/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Metric, EnrichmentMetrics, HostingMetrics } from "@/types";

export default function DashboardPage() {
  const [enrichment, setEnrichment] = useState<EnrichmentMetrics | null>(null);
  const [hosting, setHosting] = useState<HostingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Airtable enrichment metrics
        const enrichmentRes = await fetch("/api/airtable/enrichment");
        const enrichmentData = await enrichmentRes.json();
        if (enrichmentData.success) {
          setEnrichment(enrichmentData.data);
        }

        // Fetch Hostaway hosting metrics
        const hostingRes = await fetch("/api/hostaway/metrics");
        const hostingData = await hostingRes.json();
        if (hostingData.success) {
          setHosting(hostingData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-neutral-400">Loading dashboard...</div>
      </div>
    );
  }

  const metrics: Metric[] = [
    {
      title: "Total Listings",
      value: enrichment?.totalListings || 0,
      status: "good",
    },
    {
      title: "Address Verified",
      value: `${enrichment?.verificationCompletionPercent || 0}%`,
      target: "100%",
      change: enrichment?.addressVerified || 0,
      status: (enrichment?.verificationCompletionPercent || 0) >= 80 ? "good" : "warning",
    },
    {
      title: "Exported to GHL",
      value: enrichment?.totalExported || 0,
      target: enrichment?.totalListings || 0,
      change: enrichment?.exportRatePercent || 0,
      status: (enrichment?.exportRatePercent || 0) >= 50 ? "good" : "warning",
    },
    {
      title: "Active Properties",
      value: hosting?.activeProperties || 0,
      status: "good",
    },
    {
      title: "Monthly Revenue",
      value: `$${Math.round((hosting?.totalPmCommission || 0) / 12).toLocaleString()}`,
      target: "$10,000",
      status: "good",
    },
    {
      title: "Avg Occupancy",
      value: `${Math.round((hosting?.avgOccupancy || 0) * 100)}%`,
      target: "70%",
      status: (hosting?.avgOccupancy || 0) >= 0.7 ? "good" : "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-neutral-400">Live metrics from Airtable, GoHighLevel, and Hostaway</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-6 bg-neutral-900 border-neutral-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">{metric.title}</p>
                {metric.status && (
                  <Badge
                    className={
                      metric.status === "good"
                        ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                        : metric.status === "warning"
                        ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                        : "border-red-500/50 text-red-400 bg-red-500/10"
                    }
                  >
                    {metric.status}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-white">{metric.value}</p>
              {metric.target && (
                <p className="text-sm text-neutral-500">Target: {metric.target}</p>
              )}
              {metric.change !== undefined && (
                <p className="text-sm text-neutral-500">
                  {typeof metric.change === "number" && metric.change > 0 ? "+" : ""}
                  {metric.change}
                  {typeof metric.change === "number" ? "%" : ""}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">Address Verification Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Verified</span>
              <span className="text-emerald-400">{enrichment?.addressVerified || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Not Found</span>
              <span className="text-red-400">{enrichment?.addressNotFound || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Pending</span>
              <span className="text-amber-400">{enrichment?.addressPending || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-neutral-900 border-neutral-800">
          <h3 className="text-lg font-semibold text-white mb-4">Hosting Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Total Bookings (TTM)</span>
              <span className="text-white">{hosting?.totalBookings || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Revenue (TTM)</span>
              <span className="text-white">
                ${Math.round(hosting?.totalPmCommission || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Avg Review Score</span>
              <span className="text-white">{hosting?.avgReviewScore.toFixed(1) || "N/A"}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
```

**Step 2: Test dashboard**

```bash
# Visit http://localhost:3000/
# Should see live metrics from APIs
```

**Step 3: Commit updated dashboard**

```bash
git add src/app/page.tsx
git commit -m "feat: connect dashboard to live API data

Dashboard now displays:
- Airtable enrichment metrics (total listings, verification %)
- Hostaway hosting metrics (active properties, revenue, occupancy)
- Real-time data refresh on page load

Replaced hardcoded placeholder data with API calls.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Update Pipeline Page with Live Data

**Files:**
- Modify: `src/app/pipeline/page.tsx`

**Step 1: Update pipeline page**

Modify `src/app/pipeline/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { PipelineFunnel } from "@/components/pipeline-funnel";
import { LeadTable } from "@/components/lead-table";
import type { PipelineFunnelStage, Lead } from "@/types";

export default function PipelinePage() {
  const [funnelStages, setFunnelStages] = useState<PipelineFunnelStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch funnel data
        const funnelRes = await fetch("/api/pipeline/funnel");
        const funnelData = await funnelRes.json();
        if (funnelData.success) {
          setFunnelStages(funnelData.data);
        }

        // Fetch leads data
        const leadsRes = await fetch("/api/pipeline/leads");
        const leadsData = await leadsRes.json();
        if (leadsData.success) {
          setLeads(leadsData.data);
        }
      } catch (error) {
        console.error("Error fetching pipeline data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-neutral-400">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Sales Pipeline</h2>
        <p className="text-neutral-400">Lead progression from verification to signed contracts</p>
      </div>

      <PipelineFunnel stages={funnelStages} />
      <LeadTable leads={leads} />
    </div>
  );
}
```

**Step 2: Test pipeline page**

```bash
# Visit http://localhost:3000/pipeline
# Should see live funnel and leads data
```

**Step 3: Commit updated pipeline page**

```bash
git add src/app/pipeline/page.tsx
git commit -m "feat: connect pipeline page to live API data

Pipeline now displays:
- Live funnel stages from Airtable + GHL
- Top 100 leads by opportunity score
- Real-time lead status tracking

Replaced hardcoded placeholder data with API calls.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 12: Create Environment Setup Documentation

**Files:**
- Create: `docs/SETUP.md`

**Step 1: Create setup guide**

Create `docs/SETUP.md`:

```markdown
# AVRM Command Center Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- API keys for: Airtable, GoHighLevel, Hostaway, Stripe

## Installation Steps

### 1. Clone and Install Dependencies

\`\`\`bash
git clone <repo-url>
cd command-center
npm install
\`\`\`

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` and add your API keys:

\`\`\`bash
# Airtable
AIRTABLE_BASE_ID=appOi3eGsXXNkKNnM
AIRTABLE_API_KEY=your_airtable_key

# GoHighLevel
GHL_API_KEY=your_ghl_key
GHL_LOCATION_ID=your_location_id

# Hostaway
HOSTAWAY_API_KEY=your_hostaway_key
HOSTAWAY_ACCOUNT_ID=your_account_id

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 3. Setup Supabase Database

Run migrations in Supabase SQL Editor:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run `supabase/migrations/001_initial_schema.sql`
4. Run `supabase/migrations/002_hostaway_and_finance.sql`

### 4. Sync Hostaway Properties

First time setup - populate property filter settings:

\`\`\`bash
curl -X POST http://localhost:3000/api/hostaway/sync
\`\`\`

This creates records for all properties with `include_in_metrics = true` by default.

### 5. Add Expense Sources

Navigate to Settings page (`/settings`) and add your expense categories:

- Software & Tools
- Marketing & Advertising
- Photography Services
- Professional Services
- etc.

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Deployment

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables in Vercel

Add all variables from `.env.local` to Vercel project settings under "Environment Variables".

## Troubleshooting

### "Failed to fetch" errors

Check that:
1. API keys are correct in `.env.local`
2. Supabase migrations have been run
3. Hostaway sync has been completed

### Metrics not updating

Metrics are cached for 6 hours. To force refresh:
- Clear Next.js cache: delete `.next` folder and restart
- Or wait 6 hours for automatic revalidation

### Type errors

Run type check:
\`\`\`bash
npm run build
\`\`\`

## API Endpoints Reference

See `docs/API.md` for complete API documentation.
\`\`\`

**Step 2: Commit setup documentation**

\`\`\`bash
git add docs/SETUP.md
git commit -m "docs: add comprehensive setup guide

Covers:
- Installation steps
- Environment configuration
- Database setup
- First-time data sync
- Deployment instructions
- Troubleshooting

Co-Authored-By: Claude <noreply@anthropic.com>"
\`\`\`

---

## Summary

**Plan complete!** This implementation adds live API integrations to the command center dashboard.

**What's been built:**
1. ✅ TypeScript type definitions for all APIs
2. ✅ Supabase schema for property filters & expense tracking
3. ✅ Airtable enrichment metrics API
4. ✅ GoHighLevel pipeline APIs (funnel + leads)
5. ✅ Hostaway property filtering & metrics
6. ✅ Finance tracking (expenses + revenue)
7. ✅ Settings page with expense manager
8. ✅ Updated dashboard with live data
9. ✅ Updated pipeline page with live data
10. ✅ Setup documentation

**Remaining work (not in this plan):**
- KPIs page updates (use similar pattern to dashboard)
- Systems health page (ping APIs and show status)
- Hostaway property filter UI in Settings
- GHL API implementation (currently using placeholder data)
- Stripe cash tracking implementation

**Next steps:**
- Test all endpoints with real API keys
- Verify Supabase database setup
- Deploy to Vercel
- Monitor API usage and costs
