# Stripe Connect Setup Guide for Teach Niche

This comprehensive guide will walk you through setting up Stripe Connect for your platform, enabling instructors to receive payments directly while you collect platform fees.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Creating a Stripe Account](#creating-a-stripe-account)
3. [Setting Up Stripe Connect](#setting-up-stripe-connect)
4. [Configuring Webhooks](#configuring-webhooks)
5. [Testing the Integration](#testing-the-integration)
6. [Going Live](#going-live)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- Admin access to your Teach Niche platform
- A business email address
- Business details (legal name, address, tax ID)
- A bank account for receiving platform fees

## Creating a Stripe Account

1. **Sign up for Stripe**:
   - Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Enter your email address and create a secure password
   - Verify your email address

2. **Complete your account setup**:
   - Provide your business details (name, address, website)
   - Enter your tax ID information
   - Add your bank account for receiving payouts
   - Verify your identity (you may need to upload identification documents)

3. **Activate your account**:
   - Complete all verification steps required by Stripe
   - Ensure your account is fully activated before proceeding

## Setting Up Stripe Connect

1. **Enable Stripe Connect**:
   - In your Stripe Dashboard, go to "Connect" → "Settings"
   - Click "Get started with Connect"
   - Select "Express" as your Connect account type

2. **Configure Connect settings**:
   - Set your platform display name (this will be shown to instructors)
   - Upload your platform logo
   - Configure the branding colors to match your site
   - Set up your support email and URL
   - Configure your Terms of Service and Privacy Policy URLs

3. **Set up Connect Express onboarding**:
   - Customize the onboarding flow for instructors
   - Configure the information you require from instructors
   - Set up the return URL after onboarding completion

4. **Configure platform fees**:
   - In your code, the platform fee is set to 15% (`PLATFORM_FEE_PERCENTAGE = 15` in `lib/stripe.ts`)
   - You can adjust this value if needed, but ensure it aligns with your business model and instructor agreements

## Configuring Webhooks

1. **Create a webhook endpoint**:
   - In your Stripe Dashboard, go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
   - Select the events to listen for:
     - `checkout.session.completed`
     - `transfer.created`
     - `transfer.failed`
     - `account.updated` (for Connect accounts)

2. **Get your webhook secret**:
   - After creating the webhook, Stripe will provide a signing secret
   - Add this secret to your environment variables as `STRIPE_WEBHOOK_SECRET`

3. **Test your webhook**:
   - Use Stripe's webhook testing tool to send test events
   - Verify that your application correctly processes these events

## Testing the Integration

1. **Set up test API keys**:
   - In your Stripe Dashboard, go to "Developers" → "API keys"
   - Copy your test publishable key and secret key
   - Add these to your environment variables:
     - `STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`

2. **Create test instructor accounts**:
   - Register as an instructor on your platform
   - Go through the Stripe Connect onboarding process
   - Verify that the account is created in Stripe and linked in your database

3. **Test the payment flow**:
   - Create a test lesson or video
   - Purchase it using Stripe's test card numbers:
     - Success: `4242 4242 4242 4242`
     - Decline: `4000 0000 0000 0002`
   - Verify that the purchase is recorded in your database
   - Check that the instructor payout amount and platform fee are calculated correctly
   - Confirm that the transfer to the instructor's account is initiated

4. **Test webhooks**:
   - Use Stripe's webhook testing tool to simulate events
   - Verify that your application updates the database correctly
   - Check that payout statuses are updated appropriately

## Going Live

1. **Switch to live mode**:
   - In your Stripe Dashboard, toggle from "Test mode" to "Live mode"
   - Get your live API keys and update your environment variables
   - Update your webhook endpoint to use the live URL

2. **Complete Stripe verification**:
   - Ensure all required verification steps are completed
   - Provide any additional information requested by Stripe

3. **Update your platform settings**:
   - Review and update your Connect platform settings
   - Ensure all branding and support information is correct

4. **Perform a live test**:
   - Process a small real payment to verify everything works
   - Check that funds are correctly split between your platform and the instructor

## Monitoring and Maintenance

1. **Monitor transactions**:
   - Regularly check your Stripe Dashboard for transaction activity
   - Set up alerts for failed payments or transfers
   - Monitor your webhook events for any failures

2. **Handle disputes and refunds**:
   - Establish a process for handling customer disputes
   - Create a refund policy and implement it in your system
   - Train support staff on how to handle payment issues

3. **Keep your integration updated**:
   - Stay informed about Stripe API changes
   - Update your integration when new features are released
   - Test your integration after any updates

4. **Regular auditing**:
   - Periodically audit your payment records
   - Reconcile your database records with Stripe transactions
   - Verify that all instructors are receiving their correct payouts

## Troubleshooting

### Common Issues and Solutions

1. **Webhook failures**:
   - Check that your webhook URL is accessible
   - Verify that your webhook secret is correct
   - Look for errors in your webhook handler logs

2. **Connect account issues**:
   - If instructors can't complete onboarding, check your Connect settings
   - Verify that all required fields are being collected
   - Check for any restrictions based on the instructor's location

3. **Payment failures**:
   - Check the error message in the Stripe Dashboard
   - Verify that the customer's card information is valid
   - Ensure the instructor's Connect account is fully set up

4. **Transfer failures**:
   - Check if the instructor's account has any verification issues
   - Verify that the instructor has completed their banking information
   - Check for any Stripe restrictions on the account

### Support Resources

- Stripe Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Stripe Connect Guide: [https://stripe.com/docs/connect](https://stripe.com/docs/connect)
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)

## Conclusion

Setting up Stripe Connect for your platform enables a seamless payment experience for both instructors and students. By following this guide, you've established a robust payment system that automatically handles the complexities of multi-party payments, allowing you to focus on growing your platform.

Remember to regularly monitor your Stripe integration and keep it updated with the latest best practices and security measures.
