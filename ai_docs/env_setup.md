# Environment Variables Setup for AI Development

This document explains how to set up environment variables for AI-assisted development without exposing sensitive credentials.

## Environment Variables Overview

The project requires several environment variables for proper functioning:

### Supabase Variables
- `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase instance
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for Supabase client

### Stripe Variables
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Secret for verifying Stripe webhook signatures
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key for Stripe client-side

### Application Variables
- `NEXT_PUBLIC_APP_URL`: The base URL of your application

## Local Development Setup

For AI-assisted development, create a `.env.example` file with placeholder values:

```
# Supabase - Local Development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Stripe - Test Mode
STRIPE_SECRET_KEY=sk_test_51QahEYKFIWjD6A06QD7tepynFvEhPA6AWDSb46vmTlnLL6JuEOO2n84GSvUwAbuKcEA0PowqV2OglOfMtF8umIS2004O49ixYj
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51QahEYKFIWjD6A06nwkNIDLVwFp5aPA2Wctv1mAW9xZmMbRpLlwmddF8RyhjNvhp7Wr743sQ0h9ZGpBjpOjrerV500TTya0zoP
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Other settings
PLATFORM_FEE_PERCENTAGE=30
```

## Using Environment Variables with AI Development

### Option 1: Local Services

The AI agent can use local instances of Supabase and Stripe CLI:

1. Start local Supabase:
   ```bash
   supabase start
   ```

2. Start Stripe webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. Copy the webhook secret from the Stripe CLI output.

4. Create a `.env.local` file with the values from the local services.

### Option 2: Dedicated Test Environment

For a more persistent setup, create a dedicated test environment:

1. Create a separate Supabase project for testing.
2. Use Stripe test mode with dedicated test API keys.
3. Configure a `.env.test` file with these credentials.

## Environment Variable Validation

Add runtime validation for environment variables:

```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL'
];

export function validateEnv() {
  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}
```

Call this function early in your application startup.

## Handling Environment Variables in CI/CD

For GitHub Actions or other CI/CD pipelines:

1. Store sensitive values as repository secrets.
2. Generate a `.env.local` file during the build process:

```yaml
# .github/workflows/example.yml
jobs:
  build:
    steps:
      - name: Create .env file
        run: |
          echo "NEXT_PUBLIC_SUPABASE_URL=${{ secrets.SUPABASE_URL }}" >> .env.local
          echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}" >> .env.local
          # Add other environment variables
```

## Best Practices

1. **Never commit real credentials**: Keep `.env.local` in `.gitignore`.
2. **Use different values for different environments**: Maintain separate keys for development, testing, and production.
3. **Rotate keys regularly**: Especially if multiple developers or systems have access.
4. **Limit permissions**: Use the principle of least privilege for API keys.
5. **Validate environment variables**: Check for required variables at startup.

## Troubleshooting

If environment variables aren't being recognized:

1. Ensure the variable names are correct (check for typos).
2. Verify the `.env.local` file is in the project root.
3. Restart the development server after changing environment variables.
4. For Next.js, remember that only variables prefixed with `NEXT_PUBLIC_` are available in the browser.
