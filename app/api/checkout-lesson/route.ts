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
        { error: "You must be logged in to purchase a lesson" },
        { status: 401 }
      )
    }
    
    // Get request body
    const { lessonId, price, title } = await request.json()
    
    if (!lessonId || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Fetch the lesson to get Stripe product and price IDs
    const { data: lesson } = await supabase
      .from("lessons")
      .select("stripe_product_id, stripe_price_id, instructor_id")
      .eq("id", lessonId)
      .single()
    
    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }
    
    // Create a Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: lesson.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/lesson-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/lessons/${lessonId}`,
      metadata: {
        lessonId,
        userId: session.user.id,
        instructorId: lesson.instructor_id,
        productId: lesson.stripe_product_id,
        priceId: lesson.stripe_price_id
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
