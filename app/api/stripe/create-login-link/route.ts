export const dynamic = "force-dynamic"

import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { stripe, syncStripeAccountStatus } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the user's Stripe account ID
    const { data: profile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id, stripe_account_enabled")
      .eq("user_id", user.id)
      .single()

    // If no profile exists, create one and return an error
    if (!profile) {
      await supabase.from("instructor_profiles").insert({
        user_id: user.id,
        stripe_account_enabled: false,
        stripe_onboarding_complete: false,
      })

      return NextResponse.json({ message: "No Stripe account found" }, { status: 404 })
    }

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ message: "No Stripe account found" }, { status: 404 })
    }

    // Sync the account status with Stripe
    const accountStatus = await syncStripeAccountStatus(supabase, user.id, profile.stripe_account_id);

    if (!accountStatus.accountEnabled) {
      return NextResponse.json({ message: "Stripe account not fully enabled" }, { status: 400 })
    }

    // Create a login link for the connected account dashboard
    const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id)

    return NextResponse.json({ url: loginLink.url })
  } catch (error: any) {
    console.error("Stripe login link error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
