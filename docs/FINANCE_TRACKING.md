# Finance Tracking Requirements

## Data Sources

### 1. Revenue (from Hostaway)
- **Source**: Hostaway API `/reservations`
- **Metric**: `pmCommissionAmount` (your management fee)
- **Aggregation**: Sum all pmCommission amounts per month
- **Time Period**: Trailing Twelve Months (TTM)

### 2. Cash In Bank (from Stripe)
- **Source**: Stripe API
- **Metric**: Monthly payments received for invoices
- **What to track**: Actual cash collected (not invoiced amounts)
- **Endpoint**: Stripe Payments API or Invoices API (filter by `status: paid`)

### 3. Expenses (Manual Entry)
- **Source**: Configuration page (manual data entry)
- **UI**: Settings page with expense management
- **Structure**: Expense sources with monthly amounts
- **Persistence**: Supabase database

## Manual Expense Tracking System

### Supabase Schema

```sql
-- Expense Categories/Sources
CREATE TABLE expense_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Monthly Expense Entries
CREATE TABLE expense_entries (
  id SERIAL PRIMARY KEY,
  source_id INTEGER REFERENCES expense_sources(id),
  month DATE NOT NULL, -- First day of month (e.g., 2025-01-01)
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, month)
);
```

### Settings Page - Expense Management UI

**Features**:
1. **Add Expense Source** - Create new recurring expense category
   - Name (e.g., "Software Subscriptions", "Cleaning Supplies", "Marketing")
   - Description
   - Mark as recurring

2. **Monthly Expense Entry** - Grid view by month
   - Rows: Expense sources
   - Columns: Last 12 months
   - Editable cells: Amount for each source/month
   - Auto-save on blur
   - Quick copy from previous month button

3. **Expense Source Management**
   - Edit/delete expense sources
   - Archive old sources
   - Bulk import from CSV

### Example Expense Sources
- Software & Tools (Airtable, Hostaway, etc.)
- Marketing & Advertising
- Photography Services
- Professional Services (Accountant, Legal)
- Office Supplies
- Travel & Meetings
- Insurance
- Other

## Key Financial Metrics

### Dashboard Widgets

1. **Monthly Revenue (Gross)** - Current month pmCommission (MTD)
   - Target: Based on property count × avg commission
   - Status: good/warning/bad based on target

2. **Monthly Profit** - Current month revenue minus expenses
   - Shows net cash flow for the month

3. **TTM Gross Revenue** - Sum of pmCommission (last 12 months)
   - Trend: Compare to previous 12 months

4. **TTM Expenses** - Sum of all expenses (last 12 months)
   - Trend: Expense growth rate

5. **TTM Net Revenue (Profit)** - TTM Gross Revenue - TTM Expenses
   - Primary profitability metric
   - Profit margin % = (Net Revenue / Gross Revenue) × 100

6. **Cash Reserves** - From Stripe balance + bank account
   - Months of runway = Cash Reserves / Avg Monthly Expenses

### Finance KPIs Page

**Top Section - Current Month**
- Revenue (MTD)
- Expenses (MTD)
- Net Profit (MTD)
- Profit Margin %

**Charts - Trailing 12 Months**
1. **Revenue Trend** (line chart)
   - Monthly pmCommission over 12 months

2. **Expense Trend** (stacked bar chart)
   - Monthly expenses by category
   - Total expense line overlay

3. **Profit Trend** (area chart)
   - Revenue (line)
   - Expenses (line)
   - Net Profit (filled area between)

4. **Profit Margin %** (line chart)
   - Monthly profit margin trend
   - Target line at 30-50%

**Bottom Section - Breakdown Tables**
1. **Revenue by Property** (last 12 months)
   - Property name
   - TTM commission
   - % of total revenue
   - Monthly avg

2. **Expenses by Category** (last 12 months)
   - Expense source
   - TTM total
   - % of total expenses
   - Monthly avg
   - Trend (↑↓→)

## API Integration Details

### Hostaway Revenue Calculation
```typescript
// Fetch reservations for TTM
const reservations = await fetchHostaway('/reservations', {
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31'
});

// Sum pmCommissionAmount by month
const monthlyRevenue = reservations.reduce((acc, res) => {
  const month = res.arrivalDate.slice(0, 7); // "2024-01"
  acc[month] = (acc[month] || 0) + res.pmCommissionAmount;
  return acc;
}, {});

// TTM total
const ttmRevenue = Object.values(monthlyRevenue).reduce((sum, amt) => sum + amt, 0);
```

### Stripe Cash Collection
```typescript
// Fetch paid invoices for month
const payments = await stripe.invoices.list({
  status: 'paid',
  created: {
    gte: startOfMonth,
    lt: endOfMonth
  }
});

// Sum amount paid
const cashCollected = payments.data.reduce((sum, inv) => sum + (inv.amount_paid / 100), 0);
```

### Expense Aggregation
```typescript
// Fetch expenses for TTM from Supabase
const { data: expenses } = await supabase
  .from('expense_entries')
  .select('month, amount, expense_sources(name)')
  .gte('month', oneYearAgo)
  .lte('month', today);

// Aggregate by month
const monthlyExpenses = expenses.reduce((acc, exp) => {
  acc[exp.month] = (acc[exp.month] || 0) + exp.amount;
  return acc;
}, {});

// TTM total
const ttmExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
```

## Important Notes
- **No owner payouts tracking** - pmCommission is net revenue to you
- **TTM metrics, not ARR** - Use Trailing Twelve Months for all financial calculations
- **Manual expense entry** - Expenses are stable month-to-month, easy to maintain
- **Stripe = Cash In Bank** - Track actual payments received, not invoiced amounts
- Build expense management into Settings page
