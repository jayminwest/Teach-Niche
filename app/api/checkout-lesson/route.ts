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
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("stripe_product_id, stripe_price_id, instructor_id")
      .eq("id", lessonId)
      .single()
    
    if (lessonError || !lesson) {
      console.error("Error fetching lesson:", lessonError)
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      )
    }
    
    // Validate that the lesson has the required Stripe IDs
    if (!lesson.stripe_product_id || !lesson.stripe_price_id) {
      console.error("Lesson missing Stripe product or price ID:", lesson)
      
      // Create a new Stripe product and price if missing
      const priceInCents = Math.round(Number(price) * 100)
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          description: `Lesson: ${title}`,
          price: priceInCents,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create Stripe product: ${errorText}`)
      }
      
      const { productId, priceId } = await response.json()
      
      // Update the lesson with the new Stripe IDs
      const { error: updateError } = await supabase
        .from("lessons")
        .update({
          stripe_product_id: productId,
          stripe_price_id: priceId,
        })
        .eq("id", lessonId)
      
      if (updateError) {
        console.error("Error updating lesson with Stripe IDs:", updateError)
        throw new Error("Failed to update lesson with Stripe product information")
      }
      
      // Use the new IDs
      lesson.stripe_product_id = productId
      lesson.stripe_price_id = priceId
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
