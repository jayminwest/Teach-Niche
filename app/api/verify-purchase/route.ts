import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to verify a purchase" },
        { status: 401 }
      )
    }
    
    // Get the session ID from the query parameters
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session ID" },
        { status: 400 }
      )
    }
    
    // Retrieve the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!checkoutSession) {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      )
    }
    
    // Verify the payment status
    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }
    
    // Get the video ID from the metadata
    const videoId = checkoutSession.metadata?.videoId
    
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID not found in session metadata" },
        { status: 400 }
      )
    }
    
    // Check if this purchase has already been recorded
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("video_id", videoId)
      .eq("stripe_payment_id", checkoutSession.id)
      .maybeSingle()
    
    if (existingPurchase) {
      // Purchase already recorded, return success
      return NextResponse.json({ 
        success: true,
        videoId
      })
    }
    
    // Record the purchase in the database
    const { error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: session.user.id,
        video_id: videoId,
        stripe_payment_id: checkoutSession.id,
        amount: checkoutSession.amount_total ? checkoutSession.amount_total / 100 : 0,
        stripe_product_id: checkoutSession.metadata?.productId,
        stripe_price_id: checkoutSession.metadata?.priceId,
      })
    
    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError)
      return NextResponse.json(
        { error: `Failed to record purchase: ${purchaseError.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      videoId
    })
  } catch (error: any) {
    console.error("Error verifying purchase:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify purchase" },
      { status: 500 }
    )
  }
}
