# Environment Utilities Implementation Guide

This document provides implementation guidance for creating environment utilities in TeachNiche.

## Environment Validation Module

Create a new file at `lib/env-utils.ts`:

```typescript
/**
 * Environment variable validation and utilities
 */

// Required environment variables
const REQUIRED_ENV_VARS = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'URL of your Supabase project',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Anonymous key for Supabase client',
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Publishable key for Stripe client',
  STRIPE_SECRET_KEY: 'Secret key for Stripe API',
  
  // Application
  NEXT_PUBLIC_SITE_URL: 'Base URL of your application',
}

// Optional environment variables with default values
const OPTIONAL_ENV_VARS = {
  STRIPE_APPLICATION_FEE_PERCENT: {
    default: '15',
    description: 'Platform fee percentage (0-100)',
  },
  NEXT_PUBLIC_STRIPE_CONNECT_REDIRECT_URL: {
    default: (env: NodeJS.ProcessEnv) => `${env.NEXT_PUBLIC_SITE_URL}/dashboard/stripe-connect/success`,
    description: 'Redirect URL after Stripe Connect onboarding',
  },
  NODE_ENV: {
    default: 'development',
    description: 'Node environment (development, production, test)',
  },
}

/**
 * Validates all required environment variables
 * @returns An object with a valid flag and any missing variables
 */
export function validateEnv(): { valid: boolean; missing: string[]; message: string } {
  const missing = Object.keys(REQUIRED_ENV_VARS).filter(
    (envVar) => !process.env[envVar]
  )

  const valid = missing.length === 0
  let message = valid
    ? 'All required environment variables are set'
    : `Missing required environment variables: ${missing.join(', ')}`

  return { valid, missing, message }
}

/**
 * Gets an environment variable with fallback to default value
 * @param key The environment variable key
 * @param fallback Optional fallback value if not found
 * @returns The environment variable value or fallback
 */
export function getEnv(key: string, fallback?: string): string | undefined {
  const value = process.env[key]
  
  if (value) return value
  
  // Check if it's an optional variable with a default
  if (OPTIONAL_ENV_VARS[key as keyof typeof OPTIONAL_ENV_VARS]) {
    const optional = OPTIONAL_ENV_VARS[key as keyof typeof OPTIONAL_ENV_VARS]
    
    if (typeof optional.default === 'function') {
      return optional.default(process.env)
    }
    
    return optional.default
  }
  
  return fallback
}

/**
 * Checks if the current environment is production
 * @returns true if in production environment
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Checks if the current environment is development
 * @returns true if in development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
}

/**
 * Gets the current environment name
 * @returns The environment name (development, production, test)
 */
export function getEnvironment(): string {
  return process.env.NODE_ENV || 'development'
}

/**
 * Logs the current environment configuration (safe version without secrets)
 */
export function logEnvironment(): void {
  if (isDevelopment()) {
    console.log(`Environment: ${getEnvironment()}`)
    console.log(`Site URL: ${process.env.NEXT_PUBLIC_SITE_URL}`)
    console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    console.log(`Using Stripe: ${!!process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No'}`)
    
    const { valid, missing } = validateEnv()
    if (!valid) {
      console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`)
    }
  }
}

export default {
  validateEnv,
  getEnv,
  isProduction,
  isDevelopment,
  getEnvironment,
  logEnvironment,
}
```

## Implementing in Stripe Service

Update `lib/stripe.ts` to use environment utilities:

```typescript
import Stripe from "stripe"
import { getEnv, isDevelopment } from "./env-utils"

// Initialize Stripe
let stripe: Stripe;

// Only initialize if we have a key
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-03-31.basil",
    appInfo: {
      name: "Teach Niche",
      version: "0.1.0",
      // Include environment in app info for better tracking
      environment: isDevelopment() ? 'development' : 'production',
    },
  });
  
  if (isDevelopment()) {
    console.log(`🔌 Stripe initialized in ${isDevelopment() ? 'TEST' : 'LIVE'} mode`);
  }
} else {
  console.error("STRIPE_SECRET_KEY is missing. Stripe functionality will be limited.");
  // Create a placeholder to avoid null errors
  stripe = new Stripe('sk_test_placeholder', {
    apiVersion: "2025-03-31.basil",
  });
}

export { stripe }

// Constants for the platform fee percentage - read from env with fallback
export const PLATFORM_FEE_PERCENTAGE = parseInt(getEnv('STRIPE_APPLICATION_FEE_PERCENT', '15'), 10)
export const INSTRUCTOR_PERCENTAGE = 100 - PLATFORM_FEE_PERCENTAGE
```

## Implementing in Supabase Client

Update `lib/supabase/client.ts` to add environment awareness:

```typescript
"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { isDevelopment } from "../env-utils"

// Create a cache to store client instances
let clientInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  // Return the cached instance if it exists
  if (clientInstance) {
    return clientInstance
  }

  // Check that required environment variables exist
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Supabase configuration is missing, client will not function correctly");
  }

  // Create a new instance if one doesn't exist
  clientInstance = createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options: {
      // Add Supabase client options
      auth: {
        persistSession: true,
      },
      // Log in development only
      global: {
        fetch: (...args) => {
          // In development, we can add additional logging or debugging
          if (isDevelopment()) {
            const [url] = args;
            // Only log certain URL patterns to avoid excessive logging
            if (typeof url === 'string' && url.includes('/auth/') && !url.includes('exchange')) {
              console.log(`🔌 Supabase request: ${url.split('/').slice(-2).join('/')}`);
            }
          }
          return fetch(...args);
        }
      }
    }
  })
  
  // In development mode, log the connection info
  if (isDevelopment() && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
    if (projectRef) {
      console.log(`🔌 Connected to Supabase project: ${projectRef}`);
    }
  }
  
  return clientInstance
}
```

## Application Startup Validation

In `app/layout.tsx`, add environment validation:

```typescript
import { validateEnv, logEnvironment } from "@/lib/env-utils"

// Validate environment variables on server
const { valid, message } = validateEnv()
if (!valid && process.env.NODE_ENV !== 'production') {
  console.error(`❌ Environment validation failed: ${message}`)
}

// Log environment in development
if (process.env.NODE_ENV === 'development') {
  logEnvironment()
}
```

## Next Steps for Implementation

1. Create the actual files as described above
2. Add environment validation to critical server components
3. Update service initialization with better error handling
4. Add environment-specific startup logs
5. Test with both development and production configurations