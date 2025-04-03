import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to purchase a video" },
        { status: 401 }
      )
    }
    
    // Get request body
    const { videoId, price, title } = await request.json()
    
    if (!videoId || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Fetch the video to get Stripe product and price IDs
    const { data: video } = await supabase
      .from("lessons")
      .select("stripe_product_id, stripe_price_id")
      .eq("id", videoId)
      .single()
    
    if (!video) {
      // Try legacy videos table
      const { data: legacyVideo } = await supabase
        .from("videos")
        .select("stripe_product_id, stripe_price_id")
        .eq("id", videoId)
        .single()
      
      if (!legacyVideo) {
        return NextResponse.json(
          { error: "Video not found" },
          { status: 404 }
        )
      }
      
      video = legacyVideo
    }
    
    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: video.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/videos/${videoId}`,
      metadata: {
        videoId,
        userId: session.user.id,
      },
    })
    
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
