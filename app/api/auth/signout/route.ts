import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()
  const supabase = await createServerClient()
  
  // Server-side signout that properly clears cookies
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error("Error during server-side signout:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
  
  // Clear all supabase-related cookies to be extra thorough
  // This helps with environments where cookie management might be different
  cookieStore.getAll().forEach(cookie => {
    if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
      cookieStore.delete(cookie.name)
    }
  })
  
  return NextResponse.json({ success: true })
}