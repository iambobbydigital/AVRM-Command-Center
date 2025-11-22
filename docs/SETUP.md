# AVRM Command Center Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- API keys for: Airtable, GoHighLevel, Hostaway, Stripe

## Installation Steps

### 1. Clone and Install Dependencies

```bash
git clone <repo-url>
cd command-center
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```bash
# Airtable
AIRTABLE_BASE_ID=appOi3eGsXXNkKNnM
AIRTABLE_API_KEY=your_airtable_key

# GoHighLevel
GHL_API_KEY=your_ghl_key
GHL_LOCATION_ID=your_location_id

# Hostaway
HOSTAWAY_API_KEY=your_hostaway_key
HOSTAWAY_ACCOUNT_ID=your_account_id

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Supabase Database

Run migrations in Supabase SQL Editor:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run `supabase/migrations/001_initial_schema.sql`
4. Run `supabase/migrations/002_hostaway_and_finance.sql`

### 4. Sync Hostaway Properties

First time setup - populate property filter settings:

```bash
curl -X POST http://localhost:3000/api/hostaway/sync
```

This creates records for all properties with `include_in_metrics = true` by default.

### 5. Add Expense Sources

Navigate to Settings page (`/settings`) and add your expense categories:

- Software & Tools
- Marketing & Advertising
- Photography Services
- Professional Services
- etc.

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### Vercel Deployment

1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables in Vercel

Add all variables from `.env.local` to Vercel project settings under "Environment Variables".

## Troubleshooting

### "Failed to fetch" errors

Check that:
1. API keys are correct in `.env.local`
2. Supabase migrations have been run
3. Hostaway sync has been completed

### Metrics not updating

Metrics are cached for 6 hours. To force refresh:
- Clear Next.js cache: delete `.next` folder and restart
- Or wait 6 hours for automatic revalidation

### Type errors

Run type check:
```bash
npm run build
```

## API Endpoints Reference

See `docs/API.md` for complete API documentation.
