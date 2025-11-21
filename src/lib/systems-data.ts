// Types for AVRM Systems Data
export interface Goal {
  id: string;
  name: string;
  description: string;
  success_metric: string;
  target: string;
}

export interface AVRMFunction {
  id: string;
  name: string;
  sequence: number;
  description: string;
  goal: Goal;
  task_ids: string[];
  asset_ids: string[];
  kpi_ids: string[];
}

export interface Task {
  id: string;
  code: string;
  name: string;
  function_id: string;
  description: string;
  output: string;
  asset_ids?: string[];
  time_estimate?: string;
  frequency?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  description: string;
  url?: string;
  function_ids: string[];
}

export interface ProcessFlow {
  id: string;
  name: string;
  description: string;
  sequence: { task_id: string; description?: string }[];
}

export interface SystemsData {
  version: string;
  last_updated: string;
  functions: AVRMFunction[];
  tasks: Task[];
  assets: Asset[];
  process_flows: ProcessFlow[];
}

// Hardcoded data based on YAML (in production, fetch from API)
export const systemsData: SystemsData = {
  version: "1.0.0",
  last_updated: "2025-11-20",
  functions: [
    {
      id: "marketing",
      name: "Marketing",
      sequence: 1,
      description: "Generate qualified leads for vacation rental management services",
      goal: { id: "goal_booked_meetings", name: "Book Meetings", description: "Book qualified discovery meetings", success_metric: "Meetings/month", target: "8-15/month" },
      task_ids: ["m1_build_leads", "m2_find_address", "m3_evaluate_listing", "m4_create_materials", "m5_setup_campaigns", "m6_send_outreach", "m7_follow_up", "m8_communicate_responders", "m9_book_meeting"],
      asset_ids: ["avrm_crm_sheet", "rabbu", "pricelabs", "gohighlevel"],
      kpi_ids: []
    },
    {
      id: "sales",
      name: "Sales",
      sequence: 2,
      description: "Convert qualified leads into signed clients",
      goal: { id: "goal_signed_contract", name: "Signed Contract", description: "Close deals and collect fees", success_metric: "Signed agreements/month", target: "2-4/month" },
      task_ids: ["s1_property_research", "s2_discovery_meeting", "s3_create_presentation", "s4_customize_agreement", "s5_conversion_meeting", "s6_create_invoice"],
      asset_ids: ["rabbu", "pricelabs", "pitch_deck", "stripe_invoicing"],
      kpi_ids: []
    },
    {
      id: "onboarding",
      name: "Onboarding",
      sequence: 3,
      description: "Setup new client properties for successful management",
      goal: { id: "goal_live_listing", name: "Live Listing", description: "Property live on all channels", success_metric: "Days to live", target: "7-14 days" },
      task_ids: ["o1_onboarding_meeting", "o2_schedule_photography", "o3_edit_photos", "o4_listing_copywriting", "o5_listing_setup", "o6_pricing_setup", "o7_messaging_setup", "o8_client_account", "o9_cleaner_setup"],
      asset_ids: ["hostaway", "pricelabs", "photography_service"],
      kpi_ids: []
    },
    {
      id: "hosting",
      name: "Hosting",
      sequence: 4,
      description: "Deliver exceptional guest experiences",
      goal: { id: "goal_bookings_reviews", name: "Bookings & 5★ Reviews", description: "High occupancy with satisfaction", success_metric: "Occupancy & rating", target: "60-80%, 4.8+" },
      task_ids: ["h1_respond_inquiries", "h2_communicate_guests", "h3_coordinate_cleanings", "h4_communicate_owners", "h5_manage_issues", "h6_export_tax_docs"],
      asset_ids: ["hostaway", "ota_airbnb", "ota_vrbo"],
      kpi_ids: []
    },
    {
      id: "finance",
      name: "Finance",
      sequence: 5,
      description: "Manage cash flow, payments, and profitability",
      goal: { id: "goal_cashflow_profits", name: "Cashflow & Profits", description: "Positive cash flow with margins", success_metric: "Monthly profit margin", target: "30-50%" },
      task_ids: ["f1_owner_statements", "f2_track_revenue", "f3_track_expenses", "f4_create_invoices", "f5_owner_payouts", "f6_pay_myself", "f7_prepare_tax_docs"],
      asset_ids: ["hostaway", "stripe_invoicing", "quickbooks"],
      kpi_ids: []
    }
  ],
  tasks: [
    // Marketing
    { id: "m1_build_leads", code: "M1", name: "Build Lead Lists", function_id: "marketing", description: "Identify target properties", output: "Lead List" },
    { id: "m2_find_address", code: "M2", name: "Find Address", function_id: "marketing", description: "Geocode property addresses", output: "Address" },
    { id: "m3_evaluate_listing", code: "M3", name: "Evaluate Listing", function_id: "marketing", description: "Score opportunity", output: "Opportunity Score" },
    { id: "m4_create_materials", code: "M4", name: "Create Materials", function_id: "marketing", description: "Generate outreach content", output: "Marketing Materials" },
    { id: "m5_setup_campaigns", code: "M5", name: "Setup Campaigns", function_id: "marketing", description: "Configure automation", output: "Campaign" },
    { id: "m6_send_outreach", code: "M6", name: "Send Outreach", function_id: "marketing", description: "Execute campaigns", output: "Outreach Sent" },
    { id: "m7_follow_up", code: "M7", name: "Follow Up", function_id: "marketing", description: "Multi-touch sequences", output: "Follow-ups" },
    { id: "m8_communicate_responders", code: "M8", name: "Communicate", function_id: "marketing", description: "Engage with responders", output: "Qualified Lead" },
    { id: "m9_book_meeting", code: "M9", name: "Book Meeting", function_id: "marketing", description: "Schedule discovery call", output: "Booked Meeting" },
    // Sales
    { id: "s1_property_research", code: "S1", name: "Property Research", function_id: "sales", description: "Deep dive analysis", output: "Research Brief" },
    { id: "s2_discovery_meeting", code: "S2", name: "Discovery Meeting", function_id: "sales", description: "Understand needs", output: "Discovery Notes" },
    { id: "s3_create_presentation", code: "S3", name: "Create Presentation", function_id: "sales", description: "Custom pitch deck", output: "Presentation" },
    { id: "s4_customize_agreement", code: "S4", name: "Customize Agreement", function_id: "sales", description: "Tailor contract", output: "Agreement" },
    { id: "s5_conversion_meeting", code: "S5", name: "Conversion Meeting", function_id: "sales", description: "Present and close", output: "Decision" },
    { id: "s6_create_invoice", code: "S6", name: "Create Invoice", function_id: "sales", description: "Onboarding fee", output: "Invoice" },
    // Onboarding
    { id: "o1_onboarding_meeting", code: "O1", name: "Onboarding Meeting", function_id: "onboarding", description: "Kickoff call", output: "Onboarding Plan" },
    { id: "o2_schedule_photography", code: "O2", name: "Schedule Photography", function_id: "onboarding", description: "Book photo session", output: "Photo Appointment" },
    { id: "o3_edit_photos", code: "O3", name: "Edit Photos", function_id: "onboarding", description: "Process images", output: "Edited Photos" },
    { id: "o4_listing_copywriting", code: "O4", name: "Listing Copywriting", function_id: "onboarding", description: "Write descriptions", output: "Listing Copy" },
    { id: "o5_listing_setup", code: "O5", name: "Listing Setup", function_id: "onboarding", description: "Create listings", output: "Live Listings" },
    { id: "o6_pricing_setup", code: "O6", name: "Pricing Setup", function_id: "onboarding", description: "Configure rates", output: "Pricing Strategy" },
    { id: "o7_messaging_setup", code: "O7", name: "Messaging Setup", function_id: "onboarding", description: "Auto-messages", output: "Message Templates" },
    { id: "o8_client_account", code: "O8", name: "Client Account", function_id: "onboarding", description: "Portal access", output: "Client Portal" },
    { id: "o9_cleaner_setup", code: "O9", name: "Cleaner Setup", function_id: "onboarding", description: "Assign cleaners", output: "Cleaning Schedule" },
    // Hosting
    { id: "h1_respond_inquiries", code: "H1", name: "Respond to Inquiries", function_id: "hosting", description: "Answer questions", output: "Response" },
    { id: "h2_communicate_guests", code: "H2", name: "Guest Communication", function_id: "hosting", description: "Pre/during/post stay", output: "Guest Updates" },
    { id: "h3_coordinate_cleanings", code: "H3", name: "Coordinate Cleanings", function_id: "hosting", description: "Schedule turnovers", output: "Clean Property" },
    { id: "h4_communicate_owners", code: "H4", name: "Owner Communication", function_id: "hosting", description: "Updates and reports", output: "Owner Updates" },
    { id: "h5_manage_issues", code: "H5", name: "Manage Issues", function_id: "hosting", description: "Problem resolution", output: "Resolution" },
    { id: "h6_export_tax_docs", code: "H6", name: "Export Tax Docs", function_id: "hosting", description: "Tax documentation", output: "Tax Records" },
    // Finance
    { id: "f1_owner_statements", code: "F1", name: "Owner Statements", function_id: "finance", description: "Monthly reports", output: "Statement" },
    { id: "f2_track_revenue", code: "F2", name: "Track Revenue", function_id: "finance", description: "Income tracking", output: "Revenue Report" },
    { id: "f3_track_expenses", code: "F3", name: "Track Expenses", function_id: "finance", description: "Expense tracking", output: "Expense Report" },
    { id: "f4_create_invoices", code: "F4", name: "Create Invoices", function_id: "finance", description: "Bill clients", output: "Invoice" },
    { id: "f5_owner_payouts", code: "F5", name: "Owner Payouts", function_id: "finance", description: "Pay owners", output: "Payout" },
    { id: "f6_pay_myself", code: "F6", name: "Pay Myself", function_id: "finance", description: "Owner draw", output: "Payment" },
    { id: "f7_prepare_tax_docs", code: "F7", name: "Prepare Tax Docs", function_id: "finance", description: "Annual taxes", output: "Tax Package" }
  ],
  assets: [],
  process_flows: []
};
