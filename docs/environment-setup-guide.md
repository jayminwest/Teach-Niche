# Environment Setup Guide for TeachNiche

This guide outlines the plan for properly setting up development and production environments for TeachNiche.

## Current Issues

1. **Mixed Environment Keys**: Currently using production Supabase with both test and live Stripe keys
2. **No Environment Separation**: No clear separation between development and production configurations
3. **Data Integrity Risk**: Development work could affect production data
4. **Missing Environment Validation**: No validation to ensure all required variables are set
5. **Inconsistent Configuration**: Some values (like platform fees) are hard-coded

## Environment Structure Plan

TeachNiche will use two distinct environments:
1. **Development** - For local development and testing
2. **Production** - For live application

Each environment will have its own:
- Supabase project
- Stripe API keys (Test mode for development, Live mode for production)
- Environment-specific configuration

## Required Code Changes

1. **Create Environment Utilities**
   - Add environment validation function
   - Add environment-specific configuration getters
   - Make platform fees configurable via environment

2. **Update Service Clients**
   - Modify Stripe client to use environment-aware configuration
   - Update Supabase client to properly handle environment variables
   - Add environment logging in development mode

3. **Fix Environment Variable Handling**
   - Ensure consistent environment variable usage across the codebase
   - Add proper error handling for missing configuration

## Environment Files Structure

| File | Purpose | Committed to Git |
|------|---------|------------------|
| `.env.example` | Template with all required variables | Yes |
| `.env.development` | Development environment variables | No |
| `.env.production` | Production environment variables | No |
| `.env.local` | Local overrides for any environment | No |

## Required Environment Variables

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Stripe Configuration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Stripe Connect Configuration
```
STRIPE_CONNECT_CLIENT_ID=your_client_id
NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URL=your_redirect_url
STRIPE_PLATFORM_ACCOUNT_ID=your_platform_account_id
STRIPE_APPLICATION_FEE_PERCENT=15
```

### Application Configuration
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
NODE_ENV=development|production
```

## Development Environment Setup Plan

### 1. Create a Separate Supabase Project

1. Create a new Supabase project specifically for development
2. Migrate the schema from production to development
3. Create test data in the development environment

```bash
# After installing Supabase CLI
supabase init
supabase link --project-ref your-dev-project-ref
supabase db push
```

### 2. Configure Stripe Test Environment

1. Use Stripe Test Mode API keys
2. Set up local webhook forwarding for development
3. Create test products, prices, and connect accounts

```bash
# For local webhook testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Environment Variables for Development

```
# Supabase Development Environment
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key

# Stripe Test Environment
STRIPE_SECRET_KEY=sk_test_your_test_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret

# Stripe Connect Test Configuration
STRIPE_CONNECT_CLIENT_ID=ca_test_your_connect_id
NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URL=http://localhost:3000/dashboard/stripe-connect/success

# Development Mode
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_REDIRECT_URL=http://localhost:3000/auth/callback
```

## Production Environment Setup Plan

### 1. Clean Up Production Environment

1. Audit current production Supabase for test data
2. Ensure Stripe is using all live mode keys
3. Configure proper webhook endpoints for production

### 2. Environment Variables for Production

```
# Supabase Production Environment
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key

# Stripe Live Environment
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Stripe Connect Live Configuration
STRIPE_CONNECT_CLIENT_ID=ca_live_your_connect_id
NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URL=https://your-domain.com/dashboard/stripe-connect/success

# Production Mode
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://your-domain.com/auth/callback
```

## Implementation Steps

1. **Create Environment Utility Module**
   - Implement `validateEnv()` function to check required variables
   - Add environment-specific utilities (isDevelopment, isProduction)
   - Make configuration values read from environment variables

2. **Update Service Initializations**
   - Modify Stripe client to use proper environment detection
   - Update Supabase client to validate configuration
   - Add better error handling for missing configuration

3. **Set Up Development Supabase**
   - Create new project
   - Apply all migrations
   - Set up proper RLS policies
   - Create test data

4. **Configure Stripe Test Environment**
   - Ensure all keys are test mode
   - Set up local webhook forwarding
   - Create test products and accounts

5. **Update Scripts**
   - Add environment-specific npm scripts
   - Add helper scripts for environment setup
   - Document usage in README

6. **Documentation**
   - Update README with environment instructions
   - Add troubleshooting section for common issues
   - Document environment switching process

## Security Best Practices

1. **Never commit environment files with secrets** to Git
2. **Rotate API keys regularly**, especially if team members change
3. **Use different API keys** for different environments
4. **Limit permissions** of API keys to only what's needed
5. **Set up IP restrictions** for production API keys when possible
6. **Use environment-specific webhook secrets**
7. **Monitor API usage** to detect unauthorized use

## Troubleshooting

If you encounter issues with environment variables:

1. Check that all required variables are set
2. Ensure you're using the correct environment file
3. Restart the development server after changing environment variables
4. Remember that Next.js only exposes variables prefixed with `NEXT_PUBLIC_` to the browser