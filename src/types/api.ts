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
