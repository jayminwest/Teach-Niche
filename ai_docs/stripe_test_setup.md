# Stripe Test Environment Setup

This guide explains how to set up a Stripe test environment for local development.

## Prerequisites

- Stripe account (you can sign up at [stripe.com](https://stripe.com))
- Stripe CLI installed

## Stripe Test Mode

Stripe provides a test mode that allows you to simulate payments without processing real money. All API requests in test mode use test API keys that start with `sk_test_` and `pk_test_`.

## Setting Up Stripe CLI

### Installation

Follow the installation instructions for your operating system:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop install stripe

# Linux
# See https://stripe.com/docs/stripe-cli for Linux installation
```

### Authentication

```bash
stripe login
```

This will open a browser window to authenticate with your Stripe account.

## Test Data Setup

### Creating Test Products and Prices

```bash
# Create a test product
stripe products create --name="Basic Kendama Tutorial" --description="Learn the basics of kendama"

# Create a price for the product (10.00 USD)
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=usd
```

Replace `prod_XXX` with the product ID returned from the first command.

### Creating Multiple Test Products

```bash
# Create a few test products
stripe products create --name="Advanced Kendama Tricks" --description="Master advanced kendama techniques"
stripe products create --name="Kendama Maintenance Guide" --description="Learn how to care for your kendama"

# Create prices
stripe prices create --product=prod_YYY --unit-amount=1500 --currency=usd
stripe prices create --product=prod_ZZZ --unit-amount=500 --currency=usd
```

### Test Connect Accounts

For testing Stripe Connect (instructor payouts):

```bash
# Create a test connected account
stripe connect accounts create \
  --type=express \
  --country=US \
  --email=instructor@example.com \
  --default_currency=usd

# Create an account link for onboarding
stripe connect account_links create \
  --account=acct_XXX \
  --refresh_url=http://localhost:3000/dashboard/stripe-connect/refresh \
  --return_url=http://localhost:3000/dashboard/stripe-connect \
  --type=account_onboarding
```

Replace `acct_XXX` with the account ID returned from the first command.

## Testing Webhooks

Stripe webhooks are crucial for receiving event notifications. The Stripe CLI can forward webhook events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret that you should add to your `.env.local` file:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Triggering Test Webhook Events

```bash
# Trigger a successful payment
stripe trigger payment_intent.succeeded

# Trigger a failed payment
stripe trigger payment_intent.payment_failed

# Trigger an account update (for Connect)
stripe trigger account.updated
```

## Test Credit Cards

Use these test card numbers for simulating different payment scenarios:

| Card Number           | Scenario                |
|-----------------------|-------------------------|
| 4242 4242 4242 4242   | Successful payment      |
| 4000 0000 0000 0002   | Card declined           |
| 4000 0000 0000 9995   | Insufficient funds      |
| 4000 0000 0000 3220   | 3D Secure authentication|

For all test cards:
- Use any future expiration date
- Use any 3-digit CVC
- Use any postal code

## Environment Variables

Add these to your `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_51QahEYKFIWjD6A06QD7tepynFvEhPA6AWDSb46vmTlnLL6JuEOO2n84GSvUwAbuKcEA0PowqV2OglOfMtF8umIS2004O49ixYj  # From your Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # From the stripe listen command
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51QahEYKFIWjD6A06nwkNIDLVwFp5aPA2Wctv1mAW9xZmMbRpLlwmddF8RyhjNvhp7Wr743sQ0h9ZGpBjpOjrerV500TTya0zoP # From your Stripe dashboard
```

## Testing Checkout Flow

1. Start your local development server:
   ```bash
   npm run dev
   ```

2. Start the webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Navigate to a product page and attempt a purchase using a test card.

4. Check the Stripe CLI output to see the webhook events being sent.

## Testing Connect Payouts

For testing instructor payouts:

1. Create a test connected account as shown above.

2. Complete the onboarding process by following the account link.

3. Create a test purchase for one of the instructor's products.

4. Trigger a payout:
   ```bash
   stripe transfers create \
     --amount=700 \
     --currency=usd \
     --destination=acct_XXX \
     --transfer_group=lesson_YYY
   ```

Replace `acct_XXX` with the connected account ID and `lesson_YYY` with your lesson ID.

## Troubleshooting

### Common Issues

1. **API Key Issues**:
   - Ensure you're using test mode keys (starting with `sk_test_`).
   - Verify the keys are correctly set in your `.env.local` file.

2. **Webhook Issues**:
   - Check that the webhook forwarding is running.
   - Verify the webhook secret is correctly set.
   - Ensure your endpoint is correctly handling the webhook events.

3. **Connect Account Issues**:
   - Make sure the connected account has completed onboarding.
   - Check the account status with `stripe connect accounts retrieve acct_XXX`.

### Viewing Logs

```bash
# View Stripe CLI logs
stripe logs tail

# Filter logs for specific events
stripe logs tail --filter=payment_intent
```

### Stripe Dashboard

The [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard) in test mode is a valuable tool for:
- Viewing test payments
- Checking connected accounts
- Monitoring webhook deliveries
- Inspecting logs

Always ensure you're in test mode (indicated by the "TEST" label in the dashboard).
