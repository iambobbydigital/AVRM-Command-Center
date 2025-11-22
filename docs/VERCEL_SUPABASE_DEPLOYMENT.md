# Vercel + Supabase Deployment Checklist & Testing Guide

**Last Updated:** 2025-11-22

Use this checklist for ALL future Vercel deployments with Supabase to avoid common environment variable and API integration issues.

---

## Table of Contents

1. [Pre-Deployment Setup](#pre-deployment-setup)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [Supabase Client Pattern](#supabase-client-pattern)
4. [Build-Time vs Runtime](#build-time-vs-runtime)
5. [Post-Deployment Testing](#post-deployment-testing)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [External API Patterns](#external-api-patterns)
8. [Automated Testing](#automated-testing)

---

## Pre-Deployment Setup

### 1. Environment Variables Configuration

In Vercel Dashboard → Project Settings → Environment Variables:

**CRITICAL:** Check the **"Production"** checkbox for EVERY variable!

#### Required Supabase Variables

| Variable | Environment | Description |
|----------|------------|-------------|
| `SUPABASE_URL` | **Production** | Supabase project URL (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Production** | Supabase service role key (server-side, sensitive) |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Supabase project URL (client-side) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase anon key (client-side, public) |

#### Required External API Variables

| Variable | Environment | Description |
|----------|------------|-------------|
| `HOSTAWAY_API_KEY` | **Production** | Hostaway Bearer token |
| `HOSTAWAY_ACCOUNT_ID` | **Production** | Hostaway account identifier |
| `AIRTABLE_API_KEY` | **Production** | Airtable API token |
| `AIRTABLE_BASE_ID` | **Production** | Airtable base identifier |
| `GHL_API_KEY` | **Production** | GoHighLevel API token |
| `GHL_LOCATION_ID` | **Production** | GoHighLevel location ID |

#### Optional Debugging Variable

| Variable | Environment | Description |
|----------|------------|-------------|
| `DEBUG_KEY` | All | Secret key for accessing `/api/debug/env` endpoint |

---

## Supabase Client Pattern

### Server-Side (API Routes)

```typescript
// src/lib/supabase.ts

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-side client with service role (for API routes)
export function createClient() {
  // Use SUPABASE_URL (without NEXT_PUBLIC prefix) for server-side code
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  // During build time, return a mock client to avoid build errors
  if (!supabaseUrl || !serviceRoleKey) {
    const isBuildTime = process.env.CI || process.env.VERCEL_ENV === undefined;

    if (isBuildTime) {
      console.log('[Build Time] Returning placeholder Supabase client');
      return {} as ReturnType<typeof createSupabaseClient>;
    }

    // At runtime, throw a descriptive error
    throw new Error(
      `Missing Supabase environment variables at runtime. ` +
      `Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}
```

**Usage in API routes:**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createClient(); // Uses SUPABASE_URL + SERVICE_ROLE_KEY

  const { data, error } = await supabase
    .from("table_name")
    .select("*");

  if (error) throw error;
  return NextResponse.json({ data });
}
```

### Client-Side (Components)

```typescript
// src/lib/supabase.ts (add this export)

let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

export const supabase = () => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
};
```

**Usage in components:**

```typescript
"use client";

import { supabase } from "@/lib/supabase";

export function MyComponent() {
  const client = supabase(); // Uses NEXT_PUBLIC_* vars

  const { data } = await client.from("table_name").select("*");
  return <div>{/* render data */}</div>;
}
```

---

## Build-Time vs Runtime

### The Problem

Environment variables aren't available during Next.js build phase, which can cause build failures.

### The Solution: Lazy Initialization

```typescript
// ❌ WRONG - Runs at module load time (build)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

// ✅ CORRECT - Runs at runtime
export function createClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.VERCEL_ENV === undefined) {
      return {} as SupabaseClient; // Build time placeholder
    }
    throw new Error("Missing env vars");
  }

  return createSupabaseClient(url, key);
}
```

### Build-Time Detection

Use these environment variables to detect build vs runtime:

- `process.env.CI` - Set during CI/CD builds
- `process.env.VERCEL_ENV` - `undefined` during build, `"production"` at runtime
- `process.env.NODE_ENV` - `"production"` in both build and runtime

**Best Practice:** Return placeholder objects during build, throw errors at runtime.

---

## Post-Deployment Testing

### 1. Automated Testing Script

Created: `scripts/test-deployment.sh`

**Usage:**

```bash
./scripts/test-deployment.sh https://your-app.vercel.app <debug-key>
```

**What it tests:**
- ✅ Environment variable availability (via `/api/debug/env`)
- ✅ Database connection (Supabase)
- ✅ External API integrations (Airtable, Hostaway, GHL)
- ✅ Finance tracking endpoints
- ✅ YAML data loading

### 2. Environment Diagnostics Endpoint

Created: `src/app/api/debug/env/route.ts`

**Access:**

```bash
curl "https://your-app.vercel.app/api/debug/env?key=<debug-key>"
```

**Returns:**

```json
{
  "nodeEnv": "production",
  "vercelEnv": "production",
  "supabase": {
    "SUPABASE_URL": true,
    "SUPABASE_SERVICE_ROLE_KEY": true,
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true
  },
  "hostaway": {
    "HOSTAWAY_API_KEY": true,
    "HOSTAWAY_ACCOUNT_ID": true
  },
  // ... more API credentials (boolean flags, not actual values)
  "allSupabaseKeys": ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", ...],
  "allHostawayKeys": ["HOSTAWAY_API_KEY", "HOSTAWAY_ACCOUNT_ID"]
}
```

**Security:** Requires `DEBUG_KEY` query parameter in production.

### 3. Manual UI Testing Checklist

After deployment, manually verify:

- [ ] Dashboard loads without console errors
- [ ] All API integrations return live data
- [ ] Supabase database queries work
- [ ] External API calls succeed
- [ ] No "environment variable" errors in browser console
- [ ] Settings page functions work

### 4. Vercel Logs Check

```bash
# View recent logs
vercel logs your-app.vercel.app --since 10m

# Look for:
# ❌ "environment variable" errors
# ❌ "supabaseUrl is required" errors
# ❌ 500 status codes
# ✅ Successful API calls
```

---

## Common Issues & Solutions

### Issue 1: "supabaseUrl is required"

**Symptoms:**
- Build succeeds, runtime fails
- Error: "supabaseUrl is required"

**Cause:** Environment variables not available at runtime

**Fix:**

1. Verify variables are set for **Production** in Vercel dashboard
2. Check "Production" checkbox is enabled
3. Redeploy: `vercel --prod --force`
4. Verify vars exist:
   ```bash
   vercel env pull .env.production
   cat .env.production | grep SUPABASE
   ```

### Issue 2: "Missing Supabase environment variables at runtime"

**Symptoms:**
- Error shows `Found Supabase-related vars: none`
- Finance endpoints work but Supabase queries fail

**Cause:** Variables not checked for Production environment

**Fix:**

1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. For each Supabase variable, click "⋮" → Edit
3. **Check "Production" checkbox**
4. Save
5. Redeploy: `vercel --prod`

### Issue 3: Different deployment URLs show different errors

**Symptoms:**
- `command-center-abc123.vercel.app` shows one error
- `avrm-command-center.vercel.app` shows different error

**Cause:** Each deployment has its own environment variable snapshot

**Fix:**

1. Use custom domain (`avrm-command-center.vercel.app`) not deployment-specific URLs
2. Verify env vars: `vercel env ls`
3. Re-add any missing variables to **Production** environment
4. Deploy to production URL: `vercel --prod`

### Issue 4: Hostaway API returns 403 Forbidden

**Symptoms:**
- Error: "The resource owner or authorization server denied the request"
- Status: 403

**Cause:** Missing required `X-Hostaway-Account` header

**Fix:**

```typescript
// src/lib/api-clients.ts

export async function fetchHostaway(endpoint: string) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Hostaway-Account": accountId,  // REQUIRED!
    },
  });
}
```

**Reference:** https://api.hostaway.com/documentation#authentication

### Issue 5: Airtable API returns 404 Not Found

**Symptoms:**
- Error: "Airtable error: Not Found"
- Status: 404

**Possible Causes:**

1. **Wrong API Key:** Token doesn't have access to the base
2. **Wrong Base ID:** Base ID doesn't exist or is incorrect
3. **Wrong Table Name:** Table name misspelled or doesn't exist
4. **Permissions:** API key lacks read permissions

**Fix:**

1. Verify API key in Airtable → Account → API
2. Check base ID in URL: `https://airtable.com/app<BASE_ID>/...`
3. Verify table name matches exactly (case-sensitive!)
4. Test with curl:
   ```bash
   curl "https://api.airtable.com/v0/<BASE_ID>/<TABLE_NAME>?maxRecords=1" \
     -H "Authorization: Bearer <API_KEY>"
   ```

---

## External API Patterns

### Hostaway

**Required Headers:**

```typescript
headers: {
  Authorization: `Bearer ${apiKey}`,
  "X-Hostaway-Account": accountId,  // CRITICAL!
}
```

**Endpoint:** `https://api.hostaway.com/v1/listings`

### Airtable

**Required Headers:**

```typescript
headers: {
  Authorization: `Bearer ${apiKey}`,
}
```

**Endpoint:** `https://api.airtable.com/v0/${baseId}/${tableName}`

### GoHighLevel

**Required Headers:**

```typescript
headers: {
  Authorization: `Bearer ${apiKey}`,
  Version: "2021-07-28",
}
```

**Endpoint:** `https://services.leadconnectorhq.com/...`

---

## Automated Testing

### Complete Testing Workflow

```bash
#!/bin/bash

# 1. Deploy latest code
git add -A
git commit -m "feat: your changes"
git push
vercel --prod

# 2. Get deployment URL
DEPLOY_URL=$(vercel --prod --yes | grep -o 'https://.*\.vercel\.app' | head -1)

# 3. Run diagnostic tests
./scripts/test-deployment.sh "$DEPLOY_URL" "$DEBUG_KEY"

# 4. Check Vercel logs
vercel logs avrm-command-center.vercel.app --since 10m

# 5. Manual UI verification
open "$DEPLOY_URL"
```

### Test Checklist Template

```markdown
## Deployment Test Results

**URL:** https://avrm-command-center.vercel.app
**Date:** YYYY-MM-DD
**Deployment:** <deployment-id>

### Automated Tests
- [ ] Environment diagnostics (all vars present)
- [ ] Supabase connection
- [ ] Airtable API
- [ ] Hostaway API
- [ ] GoHighLevel API
- [ ] Finance tracking
- [ ] Systems data (YAML)

### Manual UI Tests
- [ ] Dashboard loads
- [ ] KPIs display live data
- [ ] Pipeline shows leads
- [ ] Settings page functions
- [ ] No console errors

### Logs Check
- [ ] No environment variable errors
- [ ] No 500 status codes
- [ ] All API calls successful

**Status:** ✅ PASS / ❌ FAIL

**Issues Found:**
1. ...
2. ...
```

---

## Deployment Workflow

**Standard deployment process:**

```bash
# 1. Make code changes
vim src/...

# 2. Commit with descriptive message
git add -A
git commit -m "feat: description"

# 3. Push to GitHub
git push

# 4. Deploy to Vercel production
vercel --prod

# 5. Test deployment
./scripts/test-deployment.sh https://avrm-command-center.vercel.app <debug-key>

# 6. Verify in browser
open https://avrm-command-center.vercel.app

# 7. Monitor logs
vercel logs avrm-command-center.vercel.app --since 10m
```

---

## Quick Reference

### Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# Force redeploy (bypass cache)
vercel --prod --force

# List environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.vercel

# Add environment variable
vercel env add VARIABLE_NAME production

# View logs
vercel logs <project-name> --since 10m

# Get deployment info
vercel inspect <deployment-url>
```

### Testing Commands

```bash
# Run automated tests
./scripts/test-deployment.sh https://your-app.vercel.app <debug-key>

# Test specific endpoint
curl https://your-app.vercel.app/api/endpoint

# Check environment diagnostics
curl "https://your-app.vercel.app/api/debug/env?key=<debug-key>"

# View Vercel logs
vercel logs your-app.vercel.app --since 10m
```

---

## Troubleshooting Decision Tree

```
Deployment fails?
├─ Build error?
│  ├─ "supabaseUrl is required" → Use lazy initialization
│  └─ TypeScript errors → Fix type issues
│
└─ Runtime error?
   ├─ Environment vars missing?
   │  ├─ Check "Production" checkbox in Vercel
   │  └─ Redeploy with `vercel --prod --force`
   │
   ├─ API errors (403, 404)?
   │  ├─ Hostaway 403 → Check X-Hostaway-Account header
   │  ├─ Airtable 404 → Verify API key, base ID, table name
   │  └─ GHL errors → Verify API key and location ID
   │
   └─ Supabase errors?
      ├─ Check service role key vs anon key usage
      └─ Verify Supabase URL is correct
```

---

**Created:** 2025-11-22
**Project:** AVRM Command Center
**Last Tested:** 2025-11-22 on Vercel production deployment
