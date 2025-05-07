#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Testing environment switching...${NC}"

# Check for environment files
if [ ! -f ".env.development" ]; then
  echo -e "${RED}Error: .env.development file not found. Run 'pnpm setup:env' first.${NC}"
  exit 1
fi

# Check for development environment
echo -e "${BLUE}Checking development environment configuration...${NC}"
grep "NEXT_PUBLIC_SUPABASE_URL" .env.development
grep "STRIPE_SECRET_KEY" .env.development

# Retrieve project references
SUPABASE_DEV_REF=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.development | sed 's/.*https:\/\/\([^.]*\).*/\1/')
STRIPE_TEST_MODE=$(grep "STRIPE_SECRET_KEY" .env.development | grep -c "sk_test_")

echo ""
echo -e "${GREEN}Environment Configuration Summary:${NC}"
echo -e "Supabase Development Project: ${BLUE}$SUPABASE_DEV_REF${NC}"
echo -e "Stripe Test Mode: ${BLUE}$([ $STRIPE_TEST_MODE -eq 1 ] && echo "Yes" || echo "No")${NC}"

echo ""
echo -e "${YELLOW}To test the environment switching:${NC}"
echo -e "1. Run development server: ${BLUE}pnpm dev${NC}"
echo -e "2. Check console for environment logs"
echo -e "3. Run with production env: ${BLUE}pnpm dev:prod${NC}"
echo -e "4. Check console for environment differences"

echo ""
echo -e "${GREEN}For complete environment setup:${NC}"
echo -e "1. Create a separate Supabase project for development"
echo -e "2. Apply migrations to the development project"
echo -e "3. Set up Stripe webhook forwarding: ${BLUE}pnpm setup:stripe${NC}"
echo -e "4. Update the webhook secret in .env.development"

echo ""
echo -e "${YELLOW}See docs/environment-setup-guide.md for complete details${NC}"