# Stripe Connect Multi-Currency Testing Guide

This guide provides comprehensive instructions for testing Stripe Connect functionality across multiple currencies and regions. It ensures that your payment platform operates correctly regardless of the instructor's or student's location.

## Table of Contents

1. [Testing Objectives](#testing-objectives)
2. [Supported Regions and Currencies](#supported-regions-and-currencies)
3. [Test Environment Setup](#test-environment-setup)
4. [Testing Procedure](#testing-procedure)
5. [Cross-Currency Transaction Testing](#cross-currency-transaction-testing)
6. [Fee Calculation Validation](#fee-calculation-validation)
7. [Payout Testing](#payout-testing)
8. [Test Results Documentation](#test-results-documentation)
9. [Troubleshooting](#troubleshooting)

## Testing Objectives

- Verify that Stripe Connect onboarding works correctly across different regions
- Confirm that payments can be processed in multiple currencies
- Ensure platform fees are calculated correctly regardless of currency
- Validate that cross-currency transactions work as expected
- Verify that payouts are correctly processed to instructor accounts in their local currency

## Supported Regions and Currencies

This testing guide covers the following regions and currencies:

| Region | Currency | Currency Code | Test Mode Support |
|--------|----------|--------------|-------------------|
| United States | US Dollar | USD | Full |
| European Union | Euro | EUR | Full |
| United Kingdom | British Pound | GBP | Full |
| Australia | Australian Dollar | AUD | Full |
| Japan | Japanese Yen | JPY | Full |

## Test Environment Setup

### Prerequisites

- Stripe Dashboard access with test mode enabled
- Stripe CLI installed and authenticated
- Local development environment set up with environment variables

### Environment Variables

Ensure your `.env.local` file includes:

```
STRIPE_SECRET_KEY=sk_test_51QahEYKFIWjD6A06QD7tepynFvEhPA6AWDSb46vmTlnLL6JuEOO2n84GSvUwAbuKcEA0PowqV2OglOfMtF8umIS2004O49ixYj
STRIPE_WEBHOOK_SECRET=whsec_... # From the stripe listen command
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51QahEYKFIWjD6A06nwkNIDLVwFp5aPA2Wctv1mAW9xZmMbRpLlwmddF8RyhjNvhp7Wr743sQ0h9ZGpBjpOjrerV500TTya0zoP
```

### Setting Up Webhook Forwarding

Start the Stripe CLI webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Testing Procedure

### 1. Creating Test Connect Accounts for Each Region

Use the following commands to create test Connect accounts for each region:

#### United States (USD)
```bash
stripe connect accounts create \
  --type=express \
  --country=US \
  --email=instructor-us@example.com \
  --default_currency=usd
```

#### European Union (EUR)
```bash
stripe connect accounts create \
  --type=express \
  --country=DE \
  --email=instructor-eu@example.com \
  --default_currency=eur
```

#### United Kingdom (GBP)
```bash
stripe connect accounts create \
  --type=express \
  --country=GB \
  --email=instructor-uk@example.com \
  --default_currency=gbp
```

#### Australia (AUD)
```bash
stripe connect accounts create \
  --type=express \
  --country=AU \
  --email=instructor-au@example.com \
  --default_currency=aud
```

#### Japan (JPY)
```bash
stripe connect accounts create \
  --type=express \
  --country=JP \
  --email=instructor-jp@example.com \
  --default_currency=jpy
```

### 2. Generating Onboarding Links

For each account created, generate an onboarding link:

```bash
stripe connect account_links create \
  --account=acct_XXX \
  --refresh_url=http://localhost:3000/dashboard/stripe-connect/refresh \
  --return_url=http://localhost:3000/dashboard/stripe-connect/success \
  --type=account_onboarding
```

Replace `acct_XXX` with the account ID from the account creation step.

### 3. Completing Onboarding Process

1. Open the account link URL generated in the previous step
2. Complete the onboarding form with test data
3. For bank accounts, use the appropriate test bank account numbers for each region:
   - **US**: 110000000 (Routing) / 000123456789 (Account)
   - **EU (SEPA)**: DE89370400440532013000 (IBAN)
   - **UK**: 108800 (Sort code) / 00012345 (Account)
   - **AU**: BSB 000-000 / Account 000123456
   - **JP**: 0001 (Bank code) / 123 (Branch code) / 0123456 (Account)

### 4. Creating Test Products in Different Currencies

Create products for testing in each currency:

#### USD Product
```bash
stripe products create --name="US Kendama Tutorial" --description="Learn American style kendama"
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=usd
```

#### EUR Product
```bash
stripe products create --name="European Kendama Tutorial" --description="Learn European style kendama"
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=eur
```

#### GBP Product
```bash
stripe products create --name="British Kendama Tutorial" --description="Learn British style kendama"
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=gbp
```

#### AUD Product
```bash
stripe products create --name="Australian Kendama Tutorial" --description="Learn Australian style kendama"
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=aud
```

#### JPY Product
```bash
stripe products create --name="Japanese Kendama Tutorial" --description="Learn traditional Japanese kendama"
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=jpy
```

## Cross-Currency Transaction Testing

### Test Matrix

Create lessons using different Connect accounts and test purchases from various currency regions:

| Instructor Account | Product Currency | Customer Payment Method | Expected Result |
|-------------------|------------------|------------------------|-----------------|
| US (USD) | USD | USD Card | Successful, no conversion |
| US (USD) | USD | EUR Card | Successful, with conversion |
| EU (EUR) | EUR | EUR Card | Successful, no conversion |
| EU (EUR) | EUR | USD Card | Successful, with conversion |
| UK (GBP) | GBP | GBP Card | Successful, no conversion |
| UK (GBP) | GBP | USD Card | Successful, with conversion |
| AU (AUD) | AUD | AUD Card | Successful, no conversion |
| AU (AUD) | AUD | USD Card | Successful, with conversion |
| JP (JPY) | JPY | JPY Card | Successful, no conversion |
| JP (JPY) | JPY | USD Card | Successful, with conversion |

### Test Payment Cards

Use these test cards for different currencies:

| Currency | Card Number | Description |
|----------|-------------|-------------|
| USD | 4242 4242 4242 4242 | US card, successful payment |
| EUR | 4000 0000 0000 0002 | European card, decline |
| GBP | 4000 0008 0000 1234 | UK card, successful payment |
| AUD | 4000 0000 0000 0010 | Australian card, successful payment |
| JPY | 4000 0025 0000 3155 | Japanese card, successful payment |

## Fee Calculation Validation

For each transaction:

1. Record the original amount in the product's currency
2. Calculate the expected platform fee (15% of the amount)
3. Calculate the expected instructor payout (85% of the amount)
4. Verify that the actual platform fee and instructor payout match the expected values
5. For cross-currency transactions, note any conversion fees or rate differences

Example calculation for a $10 USD product:
- Original amount: $10.00 USD
- Platform fee (15%): $1.50 USD
- Instructor payout (85%): $8.50 USD

## Payout Testing

Test the payout process for each region:

```bash
# Trigger a manual payout for testing
stripe transfers create \
  --amount=850 \
  --currency=usd \
  --destination=acct_XXX \
  --transfer_group=lesson_YYY
```

Verify that:
1. The transfer is created correctly in Stripe
2. The webhook is received by your application
3. The database is updated to reflect the transfer
4. The payout appears in the instructor's Stripe Express dashboard

For cross-currency payouts, verify that:
1. The payout amount is converted to the instructor's local currency
2. The conversion rate is reasonable and documented
3. Any conversion fees are transparently displayed

## Test Results Documentation

Document your test results using the following template:

```
# Stripe Connect Multi-Currency Test Results

## Test Environment
- Test Date: YYYY-MM-DD
- Stripe API Version: 2025-03-31.basil
- Application Version: v0.1.0

## Connect Account Creation Tests
- [ ] US (USD) Account Created Successfully
- [ ] EU (EUR) Account Created Successfully
- [ ] UK (GBP) Account Created Successfully
- [ ] AU (AUD) Account Created Successfully
- [ ] JP (JPY) Account Created Successfully

## Onboarding Process Tests
- [ ] US Account Onboarding Completed
- [ ] EU Account Onboarding Completed
- [ ] UK Account Onboarding Completed
- [ ] AU Account Onboarding Completed
- [ ] JP Account Onboarding Completed

## Payment Processing Tests
(Complete for each entry in the test matrix)
- Connect Account: [Country]
- Product Currency: [Currency]
- Payment Method: [Currency] Card
- Transaction ID: ch_XXXX
- Amount: [Amount] [Currency]
- Platform Fee: [Amount] [Currency]
- Instructor Payout: [Amount] [Currency]
- Conversion Rate (if applicable): [Rate]
- Status: [Success/Failure]
- Notes: [Any observations]

## Payout Tests
- [ ] US Account Payout Successful
- [ ] EU Account Payout Successful
- [ ] UK Account Payout Successful
- [ ] AU Account Payout Successful
- [ ] JP Account Payout Successful

## Issues and Observations
- [List any issues encountered]
- [Note any unexpected behavior]
- [Document any rate conversion anomalies]

## Recommendations
- [Suggest improvements to the testing process]
- [Recommend any code changes needed]
- [Advise on production considerations]
```

## Troubleshooting

### Common Multi-Currency Issues

1. **Currency Conversion Errors**:
   - Check that Stripe supports the currency conversion pair
   - Verify that the Connect account is configured to accept the currency

2. **Onboarding Failures by Region**:
   - Different regions have different verification requirements
   - Ensure you're using the correct test data for the specified region

3. **Payout Failures**:
   - Verify the Connect account has the correct bank account information
   - Check that the account has been properly verified for the region

4. **Fee Calculation Discrepancies**:
   - Note that currency conversion may introduce small rounding differences
   - For JPY, remember there are no decimal places (smallest unit is 1 yen)

### Region-Specific Considerations

1. **European Union (EUR)**:
   - Requires Strong Customer Authentication (SCA) for payments
   - SEPA bank account information format is different from other regions

2. **Japan (JPY)**:
   - No decimal places in currency (1 JPY is the smallest unit)
   - Different address format requirements for verification

3. **Australia (AUD)**:
   - BSB and account number format for bank accounts
   - Specific tax identification requirements

4. **United Kingdom (GBP)**:
   - Post-Brexit regulations may differ from EU requirements
   - Sort code and account number format for bank accounts

5. **United States (USD)**:
   - Tax reporting requirements (W-9 form)
   - ACH routing and account number format
