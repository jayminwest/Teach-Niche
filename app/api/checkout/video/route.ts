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
      .select("stripe_product_id, stripe_price_id, instructor_id")
      .eq("id", videoId)
      .single()
    
    if (!video) {
      // Try legacy videos table
      const { data: legacyVideo } = await supabase
        .from("videos")
        .select("stripe_product_id, stripe_price_id, instructor_id")
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
    
    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
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
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/videos/${videoId}`,
      metadata: {
        videoId,
        userId: session.user.id,
        instructorId: video.instructor_id,
        productId: video.stripe_product_id,
        priceId: video.stripe_price_id
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
