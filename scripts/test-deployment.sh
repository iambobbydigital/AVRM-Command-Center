#!/bin/bash

# Deployment Testing Script for AVRM Command Center
# Usage: ./scripts/test-deployment.sh <deployment-url> <debug-key>

set -e

DEPLOYMENT_URL="${1:-https://avrm-command-center.vercel.app}"
DEBUG_KEY="${2}"

echo "================================"
echo "Testing Deployment: $DEPLOYMENT_URL"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
  local name=$1
  local endpoint=$2
  local method=${3:-GET}

  echo -n "Testing $name... "

  response=$(curl -s -w "\n%{http_code}" -X "$method" "$DEPLOYMENT_URL$endpoint" 2>&1)
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($http_code)"
    echo "  Response: $(echo "$body" | jq -c '.' 2>/dev/null || echo "$body" | head -c 100)"
  else
    echo -e "${RED}✗ FAIL${NC} ($http_code)"
    echo "  Error: $(echo "$body" | jq -r '.error' 2>/dev/null || echo "$body" | head -c 200)"
  fi
  echo ""
}

# 1. Environment Diagnostics
echo -e "${BLUE}=== 1. Environment Diagnostics ===${NC}"
if [ -n "$DEBUG_KEY" ]; then
  test_endpoint "Environment Check" "/api/debug/env?key=$DEBUG_KEY"
else
  echo -e "${YELLOW}⚠ Skipped (no DEBUG_KEY provided)${NC}"
  echo "  Usage: $0 <url> <debug-key>"
  echo ""
fi

# 2. Supabase Connection
echo -e "${BLUE}=== 2. Database Connection ===${NC}"
test_endpoint "Hostaway Properties" "/api/hostaway/properties"

# 3. External APIs
echo -e "${BLUE}=== 3. External API Integrations ===${NC}"
test_endpoint "Airtable Pipeline Leads" "/api/pipeline/leads"
test_endpoint "Hostaway Metrics" "/api/hostaway/metrics"
test_endpoint "Systems Data (YAML)" "/api/systems"

# 4. Finance Tracking
echo -e "${BLUE}=== 4. Finance Tracking ===${NC}"
test_endpoint "Expense Sources" "/api/finance/sources"
test_endpoint "Expense Entries" "/api/finance/expenses"

echo "================================"
echo "Test Complete"
echo "================================"
echo ""
echo "Next Steps:"
echo "  1. Review failed tests above"
echo "  2. Check Vercel logs: vercel logs avrm-command-center.vercel.app --since 10m"
echo "  3. Manual UI test: open $DEPLOYMENT_URL"
