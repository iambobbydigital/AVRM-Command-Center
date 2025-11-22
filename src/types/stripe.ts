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
