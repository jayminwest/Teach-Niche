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

