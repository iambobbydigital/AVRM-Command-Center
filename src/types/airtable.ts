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
  "Listing ID": string;  // Required - primary identifier
  "Address Verified"?: string;  // Optional - may be empty
  "Address Verification Status"?: "Verified" | "Not Found" | "Unverified" | "";  // Optional
  "GoHighLevel Export Status"?: string;  // Optional
  "Export Date"?: string;  // Optional
  "Overall Opportunity Score"?: number;  // Optional - calculated field
  "Annual Revenue Gap"?: number;  // Optional - calculated field
  "Bedrooms"?: number;  // Optional
  "TTM Revenue"?: number;  // Optional - from API
  "TTM Avg Rate"?: number;  // Optional - from API
  "TTM Occupancy"?: number;  // Optional - from API
  "Star Rating"?: number;  // Optional
  "Owner Contact"?: string[];  // Optional - relationship
  "Skip Trace Status"?: string;  // Optional

  // Allow additional fields from Airtable (100+ fields total)
  [key: string]: string | number | boolean | string[] | undefined;
}

export type Listing = AirtableRecord<ListingFields>;

// Owners table fields
export interface OwnerFields {
  "Owner ID"?: number;
  "First Name"?: string;
  "Last Name"?: string;
  "Best Phone"?: string;
  "Best Email"?: string;
  "GoHighLevel Contact ID"?: string;
  "Listings"?: string[];
  "Total Properties"?: number;
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
