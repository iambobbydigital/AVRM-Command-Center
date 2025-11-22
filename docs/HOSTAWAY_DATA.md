# Hostaway Data Requirements

## API Configuration
- **Refresh Rate**: Every 6 hours (not real-time)
- **Cache Strategy**: Store aggregated metrics in Supabase, refresh on schedule

## Data Structure

### Property Filtering
- **Include/Exclude Toggle**: Each property has a flag to include in dashboard metrics
- **Storage**: Supabase table `hostaway_properties` with `include_in_metrics` boolean field
- **UI**: Settings page to manage which properties are tracked

### Metrics to Track

#### Primary Revenue Metric
- **pmCommission** - Property Manager Commission (YOUR gross revenue)
  - This is the management fee you earn per property
  - NOT the guest booking revenue
  - Track per property + aggregate

#### Dashboard Metrics (Aggregate - Filtered Properties Only)
1. **Active Properties** - Count of properties with `include_in_metrics = true`
2. **Monthly Revenue** - Sum of pmCommission (current month, MTD)
3. **Avg Occupancy** - Average occupancy % across included properties
4. **Avg Review Score** - Average guest rating across included properties

#### Hosting KPIs Page

**Top Section - Aggregate Performance (Filtered)**
- Total pmCommission (MTD, YTD)
- Average occupancy rate
- Total bookings count
- Average review rating
- Average response time

**Charts - Time Series (Monthly Trends)**
- pmCommission over time (last 12 months)
- Occupancy rate trend
- Booking count trend
- Review rating trend

**Bottom Section - Individual Property Performance Table**
Columns per property:
- Property name
- pmCommission (MTD)
- Occupancy %
- Bookings count
- Avg nightly rate
- Review rating (average)
- Last booking date
- Include/Exclude toggle

### Hostaway API Endpoints Needed

```
GET /listings - Get all properties
GET /reservations - Get booking/revenue data (filter by dateFrom/dateTo)
GET /reviews - Get guest reviews
GET /conversations - Get inquiry response times (optional)
```

### Data Transformations

#### From Hostaway Response → Dashboard Format
```typescript
// Raw Hostaway reservation data includes:
{
  listingId: string;
  status: "confirmed" | "cancelled" | etc;
  channelCommissionAmount: number; // OTA commission
  pmCommissionAmount: number; // YOUR REVENUE (what we track)
  arrivalDate: string;
  departureDate: string;
  guestName: string;
  totalPrice: number; // guest pays
}

// Transform to:
{
  propertyId: string;
  propertyName: string;
  grossRevenue: number; // pmCommissionAmount
  occupancyRate: number; // calculated
  bookingsCount: number;
  avgReviewRating: number;
  includeInMetrics: boolean;
}
```

### Supabase Schema

```sql
-- Properties tracking table
CREATE TABLE hostaway_properties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  include_in_metrics BOOLEAN DEFAULT true,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cached metrics snapshots
CREATE TABLE hostaway_metrics_snapshots (
  id SERIAL PRIMARY KEY,
  property_id TEXT REFERENCES hostaway_properties(id),
  snapshot_date DATE NOT NULL,
  pm_commission DECIMAL(10,2),
  occupancy_rate DECIMAL(5,2),
  bookings_count INTEGER,
  avg_review_rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Important Notes
- **pmCommission** is the KEY metric (your actual revenue)
- Filter ALL dashboard metrics by `include_in_metrics = true`
- Store property filter preferences in database (persist across sessions)
- Refresh data every 6 hours via cron job or Next.js API caching
