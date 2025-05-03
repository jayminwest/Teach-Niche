#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Setting up development environment as the main environment...${NC}"

# Check if .env.development exists
if [ ! -f ".env.development" ]; then
  echo -e "${YELLOW}Error: .env.development file not found. Run 'pnpm setup:env' first.${NC}"
  exit 1
fi

# Create or update .env.local with development values
cp .env.development .env.local

echo -e "${GREEN}Successfully copied .env.development to .env.local${NC}"
echo -e "${YELLOW}Now you can run 'pnpm dev' to use the development environment${NC}"