import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { stripe, calculateFees, PLATFORM_FEE_PERCENTAGE } from "@/lib/stripe"
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
    const { lessonId, price, title } = await request.json()

    if (!lessonId || !price || !title) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Fetch lesson details from DB to verify price and availability
    const { data: lesson, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single()

    if (error || !lesson) {
      console.error("Lesson not found:", error)
      return NextResponse.json({ message: "Lesson not found" }, { status: 404 })
    }

    // Verify price matches (security measure)
    if (lesson.price !== price) {
      return NextResponse.json({ message: "Price mismatch" }, { status: 400 })
    }

    // Check if user has already purchased this lesson
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle()

    if (existingPurchase) {
      return NextResponse.json({ message: "You already own this lesson" }, { status: 400 })
    }

    // Get the instructor's Stripe Connect account ID
    const { data: instructorProfile } = await supabase
      .from("instructor_profiles")
      .select("stripe_account_id, stripe_account_enabled")
      .eq("user_id", lesson.instructor_id)
      .single()

    if (!instructorProfile?.stripe_account_id || !instructorProfile.stripe_account_enabled) {
      return NextResponse.json({ message: "Instructor payment setup incomplete" }, { status: 400 })
    }

    // Calculate the platform fee and instructor amount
    const amountInCents = Math.round(price * 100) // Convert to cents
    const { platformFee, instructorAmount } = calculateFees(amountInCents)

    // Create a Stripe checkout session with Connect
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title,
              description: `Kendama lesson: ${title}`,
            },
            unit_amount: amountInCents, // In cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/checkout/lesson-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/lessons/${lessonId}`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: instructorProfile.stripe_account_id,
        },
      },
      metadata: {
        lessonId,
        userId: user.id,
        type: "lesson",
        instructorId: lesson.instructor_id,
        platformFeePercentage: PLATFORM_FEE_PERCENTAGE.toString(),
      },
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

