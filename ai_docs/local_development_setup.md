# Local Development Environment Setup

This guide explains how to set up local development environments for Supabase and Stripe to facilitate AI-assisted development without exposing production credentials.

## Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- Git

## Setting Up Local Supabase

Supabase CLI provides a complete local development environment that mimics the Supabase cloud platform.

### Installation

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Starting Local Supabase

```bash
# Initialize Supabase (first time only)
supabase init

# Start the local Supabase instance
supabase start
```

After starting, you'll see output similar to:

```
Started supabase local development setup.

         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### Environment Variables for Local Supabase

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key from output above]
```

### Database Schema and Seed Data

1. Create a migration file:

```bash
supabase migration new initial_schema
```

2. Edit the generated SQL file in `supabase/migrations/` with your schema.

3. Apply migrations:

```bash
supabase db reset
```

4. Access Supabase Studio at http://localhost:54323 to manage your database visually.

## Setting Up Stripe CLI

Stripe CLI allows you to test Stripe integrations locally, including webhooks.

### Installation

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

### Testing Webhooks

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret:

```
Ready! Your webhook signing secret is whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### Environment Variables for Stripe

Add these to your `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_...  # From your Stripe dashboard (Test mode)
STRIPE_WEBHOOK_SECRET=whsec_... # From the output of stripe listen command
```

### Creating Test Data in Stripe

```bash
# Create a test product
stripe products create --name="Test Product" --description="A test product"

# Create a price for the product
stripe prices create --product=prod_XXX --unit-amount=1000 --currency=usd
```

## Complete Environment Setup

Create a `.env.local` file with all required variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Other app settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Workflow

1. Start local services:
   ```bash
   supabase start
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Start your Next.js application:
   ```bash
   npm run dev
   ```

3. Test with local data and services.

## Resetting the Environment

If you need to reset your local environment:

```bash
# Reset Supabase database to clean state
supabase db reset

# Stop Supabase
supabase stop

# Restart Supabase
supabase start
```

## Troubleshooting

### Supabase Issues

- **Database connection errors**: Ensure Docker is running and ports 54321-54326 are available.
- **Migration failures**: Check SQL syntax in migration files.
- **Authentication issues**: Verify JWT settings and roles.

### Stripe Issues

- **Webhook not receiving events**: Ensure the webhook forwarding is running and the endpoint is correct.
- **Payment failures**: Use Stripe test card numbers (e.g., 4242 4242 4242 4242).
- **API errors**: Verify your API keys are correctly set in the environment variables.
