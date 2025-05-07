import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Create middleware client
    const supabase = createMiddlewareClient({ req, res })

    // Get session (handle potential auth errors)
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Auth error in middleware:", error)
      // Continue without session, will handle protected routes below
    }
    
    const session = data?.session

    // If the user is not signed in and tries to access a protected route, redirect to login
    const protectedRoutes = ["/dashboard", "/library"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/auth/sign-in", req.url)
      redirectUrl.searchParams.set("redirectedFrom", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If a user is trying to access an instructor-only route without permission,
    // this will be handled by the route component itself,
    // since we need to check their role in the database.

    return res
  } catch (err) {
    console.error("Middleware error:", err)
    // Return the response without auth checks if there's an error
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on protected routes that require authentication:
     * - /dashboard/* (user dashboard)
     * - /library/* (user library)
     * 
     * Exclude static assets and API webhook routes
     */
    "/dashboard/:path*",
    "/library/:path*",
  ],
}

