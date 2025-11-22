# GoHighLevel Pipeline Structure

## Management Lead Conversion Pipeline

### Complete Funnel (Airtable → GHL)

#### Pre-Pipeline Stages (from Airtable)
1. **Address Verified** - Human input triggers automation
   - Source: Airtable Listings table
   - Field: `Address Verification Status = "Verified"`

2. **Exported** - Ready for GHL outreach
   - Source: Airtable Listings table
   - Field: `GoHighLevel Export Status = "Exported"`

#### GHL Pipeline Stages (in order)
3. **New Lead** - Fresh import from Airtable
4. **Hot Lead** - Engaged/responded to outreach
5. **Booked Meeting** - Discovery call scheduled
6. **No-Show** - Missed appointment (lost opportunity)
7. **Delayed** - Still interested but timing not right
8. **Closed** - Deal won/contract signed
9. **Non-Responsive** - No response to outreach (lost opportunity)

### Stage Classification

**Active Stages** (in funnel):
- New Lead
- Hot Lead
- Booked Meeting
- Delayed (nurture stage)

**Won**:
- Closed (signed contract)

**Lost**:
- No-Show (scheduled but didn't attend)
- Non-Responsive (never engaged)

### Conversion Metrics

```
Address Verified → Exported: Airtable enrichment completion
Exported → New Lead: GHL import success
New Lead → Hot Lead: Engagement rate
Hot Lead → Booked Meeting: Meeting conversion rate
Booked Meeting → Closed: Close rate
```

### Pipeline Value Calculation

Each stage tracks:
- Contact count
- Total estimated annual revenue value
- Average days in stage
- Conversion rate to next stage
