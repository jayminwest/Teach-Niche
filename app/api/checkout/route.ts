import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { stripe, calculateFees } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session: userSession },
    } = await supabase.auth.getSession()
    if (!userSession) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = userSession.user

    // Parse request body
    const { videoId, price, title } = await request.json()

    if (!videoId || !price || !title) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Fetch video details from DB to verify price and availability
    const { data: video, error } = await supabase.from("videos").select("*").eq("id", videoId).single()

    if (error || !video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 })
    }

    // Verify price matches (security measure)
    if (video.price !== price) {
      return NextResponse.json({ message: "Price mismatch" }, { status: 400 })
    }

    // Check if user has already purchased this video
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoId)
      .maybeSingle()

    if (existingPurchase) {
      return NextResponse.json({ message: "You already own this video" }, { status: 400 })
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title,
              description: `Kendama tutorial video: ${title}`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/videos/${videoId}`,
      metadata: {
        videoId,
        userId: user.id,
      },
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

