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
