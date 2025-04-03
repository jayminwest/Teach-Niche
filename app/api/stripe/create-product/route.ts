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

    // Get the user's Stripe account ID
    const { data: profile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id, stripe_account_enabled")
      .eq("user_id", user.id)
      .single()

    if (!profile?.stripe_account_id || !profile?.stripe_account_enabled) {
      return NextResponse.json({ message: "Stripe Connect account not set up or not enabled" }, { status: 400 })
    }

    // Parse request body
    const body = await request.json()
    const { name, description, price, images } = body

    if (!name || !price) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create a product in Stripe
    const product = await stripe.products.create({
      name,
      description,
      images: images || [],
      metadata: {
        userId: user.id,
      },
    })

    // Create a price for the product
    const priceObject = await stripe.prices.create({
      product: product.id,
      unit_amount: price, // in cents
      currency: "usd",
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({
      productId: product.id,
      priceId: priceObject.id,
    })
  } catch (error: any) {
    console.error("Stripe product creation error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}
