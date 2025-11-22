# Airtable Schema Reference
**Base ID**: `appOi3eGsXXNkKNnM`
**Base Name**: Vacation Rental CRM

## Tables Overview

### 1. Listings (`tblKg8BvWAOZ7n1sg`)
Primary table for vacation rental property leads and enrichment tracking.

#### Key Tracking Fields (Dashboard Metrics)
- **GoHighLevel Export Status** (`fld2GDo5ZWwDTLTQp`) - `singleLineText`
  - Values: "Exported", "Not Started", etc.
  - **KEY METRIC**: Track how many leads have been exported to GHL

- **Export Date** (`fldOKhZ7ODbnQpDrn`) - `date`
  - Tracks when record was exported to GHL

- **Address Verification Status** (`fldLQEIwdSUDkbiwQ`) - `singleSelect`
  - **Verified** (green) - Ready for automation
  - **Not Found** (red) - Geocoding failed
  - **Unverified** (gray) - Not yet processed
  - **KEY METRIC**: Track completion percentage of address verification

- **Skip Trace Status** (`fldB6NO56s5EfUTJI`) - `singleSelect`
  - Ready to Trace, Not Started, Processing, Complete, Failed

#### Calculated Opportunity Scores (All Formula Fields)
- **Overall Opportunity Score** (`fldwc7GZKxdZHkfth`) - 0-100 composite score
- **Pricing Opportunity Score** (`fldbyucMvcsWFNqn4`) - Pricing optimization potential
- **Quality Opportunity Score** (`fldus72a9fbAZrwvf`) - Photo/design quality gaps
- **Performance Gap Score** (`fldPnENRV8ehtNxLi`) - Occupancy vs market
- **Rating Improvement Score** (`fldnexN7jrtZz5US3`) - Guest rating gaps
- **Amenity Gap Score** (`fldg8L5FwiZMAKdMd`) - Missing amenities
- **Operational Efficiency Score** (`fldzPBhxfjl2Hsh8F`) - Booking settings optimization

#### Property Details
- **Listing ID** (`fldKV11EuHhg3TllA`) - multilineText
- **Link** (`fldnR2qZOfth8ATWA`) - url
- **Address Verified** (`fld3qKb9BKt233yuC`) - multilineText
- **Bedrooms** (`fldg6QbpDJBY9nbAd`) - number
- **Bathrooms** (`fldJlykzeYL5BBoIy`) - number
- **zipcode** (`fldPSfv37fYwCTVYM`) - singleLineText

#### Performance Metrics (from AirROI API)
- **TTM Revenue** (`fldCqSCjibKXahjzR`) - currency (Trailing Twelve Months)
- **TTM Avg Rate** (`fld6ha54vNHpG2hOo`) - currency (ADR)
- **TTM Occupancy** (`fldUAwCVFeLbvNeJk`) - percent
- **TTM Adjusted Occupancy** (`fldNB9VDHySJA8Ww0`) - percent
- **Star Rating** (`fld5ES09mYdd2Ztyc`) - number (0-5)
- **Reviews** (`flddxOtDC9MzIVMsI`) - number

#### Market Comparison (Lookup from Market Benchmarks)
- **Market Median ADR** (`fldXUq3YCptXx3Ewy`) - lookup
- **Market Avg Occupancy** (`fld5nFnA0HtMZyWiz`) - lookup
- **Market Top Quartile Occupancy** (`fldoUbQmlO6JL2HEf`) - lookup

#### Revenue Analysis (Calculated Fields)
- **Current Annual Revenue** (`fldq5tlcu3oNY0NYn`) - formula
- **Optimized Annual Revenue** (`fldxFR9F0dKkYpqgI`) - formula
- **Annual Revenue Gap** (`flduwf5vDuw5eBXMS`) - formula
- **Monthly Revenue Gap** (`fldgdaQEcFVf3ORsn`) - formula
- **Revenue Upside Percentage** (`fldIeEvtkALJKnHMX`) - formula

#### Photo Analysis (from Claude Vision API)
- **Photo Quality** (`fldSXAqMkONZcZyVp`) - number (0-3)
- **Interior Design Quality** (`fld93GNZiJ2LPPK0W`) - number (0-3)
- **Uniqueness** (`flde7sunEVnWULPPW`) - number (0-3)
- **Overall Quality Score** (`fldIyv5HONJKThHwr`) - formula (0-100)

#### Relationships
- **Owner Contact** (`fldpZPMMf6SZMt1cO`) - Link to Owners table
- **Market Benchmark** (`fld4CJInsKWFi6LGN`) - Link to Market Benchmarks table

---

### 2. Owners (`tblA4sTPGuj7sOPt5`)
Property owner contact information from skip tracing.

#### Fields
- **Owner ID** (`fldaIhhvuw8Ulodno`) - number
- **First Name** (`fldAtpC9h3xKFd4sc`) - multilineText
- **Last Name** (`fldo3lHhTgSWHRRof`) - multilineText
- **Best Phone** (`fldI5eSOzB0fHdkRc`) - phoneNumber
- **Best Email** (`fldQBBV6k4HtCsipn`) - email
- **Wireless Phones** (`fldcea67IoSlh5m7d`) - multilineText (JSON array)
- **Verified Emails** (`fldUr59ezaVBwBu2J`) - multilineText (JSON array)
- **Mailing Address Line 1** (`fldld54s8WvR3zvzw`) - singleLineText
- **Mailing Address Line 2** (`fldcV0aF5VEwx1VLH`) - singleLineText
- **Mailing City** (`fldn0bO9nqjQ0zUJ1`) - singleLineText
- **Mailing State** (`fld1AZeKIIHrR3EtI`) - singleLineText
- **Mailing Zip** (`fldRg2pzNaG20n29m`) - singleLineText
- **GoHighLevel Contact ID** (`fldq3OYcVDNsbuncj`) - multilineText
- **GoHighLevel Export Status** (`fldEN0GnQgEMOiGTO`) - multilineText
- **Listings** (`fldLx8NsYaezKtq7p`) - Link to Listings table (one-to-many)
- **Total Properties** (`fldtespLBWmLz3PuN`) - rollup count

---

### 3. Market Benchmarks (`tblcpVgGQwhj1LN6O`)
Aggregated market statistics by segment (bedrooms + zipcode/market).

#### Fields
- **Segment ID** (`fldNW4X5xk3wfQo7R`) - multilineText
- **Bedrooms** (`fldnW8GwQqmlUZdoG`) - number
- **Zipcode** (`fldnRxE8LqoSP3aK1`) - number
- **Market Median ADR** (`fldPmJPFr3FbKyXpc`) - currency
- **Market Avg Occupancy** (`fldJTmtRMBRw2DZaL`) - percent
- **Market Avg RevPAR** (`fldHMZ6eM7dvkOC5Y`) - currency
- **Market Top Quartile Occupancy** (`fldRXCe8vzWoT1jD0`) - percent
- **Last Updated** (`fldZsQbIfy9LE6nJZ`) - date
- **Property Count** (`fldvjXaRQy14IrQGc`) - number

---

### 4. Markets (`tblPXsNqZ9Z07fzGp`)
Geographic market definitions and characteristics.

---

### 5. Market Lookup (`tblGeyhFy3o89uEnw`)
Zipcode to market mapping table.

---

### 6. API Logs (`tbl3ylJalTa92asx0`)
Tracks all API calls and errors for debugging.

#### Fields
- **API Source** - Which API was called
- **Status** - Success/failure
- **Error Message** - If failed
- **Request Data** - What was sent
- **Response Data** - What was received
- **Duration (ms)** - Performance tracking
- **Cost** - API cost tracking
- **Listing** - Link to Listings table

---

## Key Dashboard Metrics to Track

### 1. Enrichment Pipeline Status
```
Total Listings: COUNT(all records)
Address Verified: COUNT(Address Verification Status = "Verified")
Address Not Found: COUNT(Address Verification Status = "Not Found")
Address Pending: COUNT(Address Verification Status = NULL or empty)

Verification Completion %: (Verified / Total) * 100
```

### 2. Export to GoHighLevel
```
Total Exported: COUNT(GoHighLevel Export Status = "Exported")
Export Rate %: (Exported / Total) * 100
```

### 3. Lead Quality Distribution
```
A-Tier: COUNT(Overall Opportunity Score >= 80)
B-Tier: COUNT(Overall Opportunity Score 60-79)
C-Tier: COUNT(Overall Opportunity Score < 60)
```

---

## Important Notes

- **ALL calculated fields** (formulas) exist in Airtable - DO NOT recalculate, just read them
- **Address Verification Status** is the human input that triggers automations
- **Export Date** field indicates successful export to GHL pipeline
- Use **Address Verified** field for property address, not lat/lng reverse geocode
