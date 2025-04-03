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

    // Get the session ID from the URL
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ message: "Missing session ID" }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (!stripeSession || stripeSession.payment_status !== "paid") {
      return NextResponse.json({ message: "Payment not confirmed" }, { status: 400 })
    }

    // Verify the user ID in the metadata matches
    if (stripeSession.metadata?.userId !== user.id) {
      return NextResponse.json({ message: "User mismatch" }, { status: 403 })
    }

    // Check if the purchase record exists in the database
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", stripeSession.metadata?.lessonId)
      .maybeSingle()

    if (purchaseError) {
      console.error("Error checking purchase:", purchaseError)
    }

    // If the purchase doesn't exist yet (webhook might not have processed), create it
    if (!purchase && stripeSession.metadata?.lessonId) {
      // Fetch the lesson to get the price
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select("price")
        .eq("id", stripeSession.metadata.lessonId)
        .single()

      if (lessonError || !lesson) {
        console.error("Lesson not found:", lessonError)
        return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
      }

      // Create a purchase record
      const { error } = await supabase.from("purchases").insert({
        user_id: user.id,
        video_id: stripeSession.metadata?.videoId || null,
        lesson_id: stripeSession.metadata.lessonId,
        stripe_payment_id: stripeSession.payment_intent,
        amount: lesson.price,
      })

      if (error) {
        console.error("Error creating purchase record:", error)
        return NextResponse.json({ message: "Failed to record purchase" }, { status: 500 })
      }
    }

    // Return the lesson ID
    return NextResponse.json({
      success: true,
      lessonId: stripeSession.metadata?.lessonId,
    })
  } catch (error: any) {
    console.error("Verification error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

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
    
    // Get the lesson ID from the metadata
    const lessonId = checkoutSession.metadata?.lessonId
    
    if (!lessonId) {
      return NextResponse.json(
        { error: "Lesson ID not found in session metadata" },
        { status: 400 }
      )
    }
    
    // Check if this purchase has already been recorded
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("lesson_id", lessonId)
      .eq("stripe_payment_id", checkoutSession.id)
      .maybeSingle()
    
    if (existingPurchase) {
      // Purchase already recorded, return success
      return NextResponse.json({ 
        success: true,
        lessonId
      })
    }
    
    // Record the purchase in the database
    const { error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: session.user.id,
        lesson_id: lessonId,
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
      lessonId
    })
  } catch (error: any) {
    console.error("Error verifying purchase:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify purchase" },
      { status: 500 }
    )
  }
}
