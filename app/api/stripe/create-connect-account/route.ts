import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    // Check if the user already has a Stripe account
    const { data: existingProfile } = await supabase
      .from("instructor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    // If no profile exists, create one
    if (!existingProfile) {
      const { data: newProfile } = await supabase
        .from("instructor_profiles")
        .insert({
          user_id: user.id,
          stripe_account_enabled: false,
          stripe_onboarding_complete: false,
        })
        .select()
        .single()
      
      // Set the existingProfile to the newly created profile
      if (newProfile) {
        existingProfile = newProfile
      }
    }

    // If they already have a Stripe account that's enabled, return it
    if (existingProfile?.stripe_account_id && existingProfile?.stripe_account_enabled) {
      return NextResponse.json({
        accountId: existingProfile.stripe_account_id,
        onboardingComplete: existingProfile.stripe_onboarding_complete,
      })
    }

    // If they have an account ID but it's not enabled, we'll create a new onboarding link
    let accountId = existingProfile?.stripe_account_id

    // If no account exists, create a new Stripe Connect Express account
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          userId: user.id,
        },
      })

      accountId = account.id

      // Create or update the instructor profile
      if (existingProfile) {
        await supabase
          .from("instructor_profiles")
          .update({
            stripe_account_id: accountId,
            stripe_account_enabled: false,
            stripe_onboarding_complete: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)
      } else {
        await supabase.from("instructor_profiles").insert({
          user_id: user.id,
          stripe_account_id: accountId,
          stripe_account_enabled: false,
          stripe_onboarding_complete: false,
        })
      }
    }

    // Create an account link for onboarding
    const origin = request.headers.get("origin") || "http://localhost:3000"
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/stripe-connect/refresh`,
      return_url: `${origin}/dashboard/stripe-connect/success`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url, accountId })
  } catch (error: any) {
    console.error("Stripe Connect error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

