import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: req,
  })

  try {
    // Create middleware client with @supabase/ssr
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Use getUser() instead of getSession() for security
    // IMPORTANT: Do not add code between createServerClient and supabase.auth.getUser()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error in middleware:", error)
      // Continue without session, will handle protected routes below
    }

    // If the user is not signed in and tries to access a protected route, redirect to login
    const protectedRoutes = ["/dashboard", "/library"]
    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if (!user && isProtectedRoute) {
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
