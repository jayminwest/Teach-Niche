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

