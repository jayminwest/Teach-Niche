import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/supabase"

// For Next.js 15, cookies() must be awaited
export const createServerClient = cache(() => {
  // The cookies function in Next.js 15 needs to be handled properly
  // We need to return a promise that resolves to the supabase client
  return (async () => {
    const cookieStore = await cookies()
    return createServerComponentClient<Database>({ 
      cookies: () => cookieStore 
    })
  })()
})

