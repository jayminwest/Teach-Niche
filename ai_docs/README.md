# AI Development Documentation

This directory contains documentation to help AI agents set up and work with the local development environment for this project.

## Contents

- [Local Development Setup](./local_development_setup.md) - Instructions for setting up local Supabase and Stripe environments
- [Supabase Schema Setup](./supabase_schema_setup.md) - Database schema and setup for local Supabase
- [Stripe Test Setup](./stripe_test_setup.md) - Setting up Stripe test environment and test data
- [Environment Variables Setup](./env_setup.md) - Managing environment variables for AI development

## Getting Started

For AI agents working on this project, follow these steps:

1. Read the [Local Development Setup](./local_development_setup.md) guide first
2. Set up the database schema using [Supabase Schema Setup](./supabase_schema_setup.md)
3. Configure Stripe test environment using [Stripe Test Setup](./stripe_test_setup.md)
4. Set up environment variables following [Environment Variables Setup](./env_setup.md)

## Development Workflow

1. Start local services:
   ```bash
   supabase start
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Copy the webhook signing secret from the Stripe CLI output to your `.env.local` file

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Make code changes and test with the local environment

## Testing

When testing payment flows:

1. Use Stripe test cards (e.g., 4242 4242 4242 4242)
2. Monitor webhook events in the Stripe CLI output
3. Check the Supabase database for created records

## Troubleshooting

If you encounter issues:

1. Check the Next.js server logs
2. Verify Supabase is running with `supabase status`
3. Ensure Stripe webhook forwarding is active
4. Validate environment variables are correctly set

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
