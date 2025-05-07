import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/supabase"
import { isDevelopment } from "../env-utils"

// For Next.js 15, cookies() must be awaited
export const createServerClient = cache(() => {
  // The cookies function in Next.js 15 needs to be handled properly
  // We need to return a promise that resolves to the supabase client
  return (async () => {
    // Validate that we have the required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables missing for server client");
    }
    
    const cookieStore = await cookies()
    const client = createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    })
    
    // In development mode, log the connection info (but only once)
    if (isDevelopment() && process.env.NEXT_PUBLIC_SUPABASE_URL && 
        typeof window === 'undefined') { // Only log on server-side
      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];
      if (projectRef) {
        console.log(`🔌 Server connected to Supabase project: ${projectRef}`);
      }
    }
    
    return client
  })()
})

