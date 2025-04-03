import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user

    // Get the user's Stripe account ID
    const { data: profile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .single()

    // If no profile exists, create one
    if (!profile) {
      await supabase.from("instructor_profiles").insert({
        user_id: user.id,
        stripe_account_enabled: false,
        stripe_onboarding_complete: false,
      })
      
      return NextResponse.json({
        hasAccount: false,
        accountEnabled: false,
        onboardingComplete: false,
      })
    }

    if (!profile?.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        accountEnabled: false,
        onboardingComplete: false,
      })
    }

    // Get the account details from Stripe
    const account = await stripe.accounts.retrieve(profile.stripe_account_id)

    // Check if the account is fully enabled
    const accountEnabled = account.charges_enabled && account.payouts_enabled
    const onboardingComplete = account.details_submitted

    // Update the database with the latest status
    await supabase
      .from("instructor_profiles")
      .update({
        stripe_account_enabled: accountEnabled,
        stripe_onboarding_complete: onboardingComplete,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    return NextResponse.json({
      hasAccount: true,
      accountId: profile.stripe_account_id,
      accountEnabled,
      onboardingComplete,
      account: {
        email: account.email,
        business_type: account.business_type,
        country: account.country,
        default_currency: account.default_currency,
      },
    })
  } catch (error: any) {
    console.error("Stripe account status error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

