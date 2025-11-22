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
