import { type NextRequest, NextResponse } from "next/server"
import { stripe, calculateFees } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Initialize Supabase client with service role for admin access
// This is needed for webhook operations where we don't have a user session
const supabase = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  let event

  // Verify webhook signature
  const payload = await request.text()
  const signature = request.headers.get("stripe-signature")

  try {
    event = stripe.webhooks.constructEvent(payload, signature || "", process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any

    // Extract the metadata
    const { videoId, lessonId, userId, type, instructorId, platformFeePercentage } = session.metadata

    if (!userId) {
      return NextResponse.json({ message: "Missing user ID in metadata" }, { status: 400 })
    }

    try {
      if (type === "lesson" && lessonId) {
        // Handle lesson purchase
        // Fetch the lesson to get the price
        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .select("price")
          .eq("id", lessonId)
          .single()

        if (lessonError || !lesson) {
          console.error("Lesson not found:", lessonError)
          throw new Error("Lesson not found")
        }

        // Calculate the platform fee and instructor amount
        const amountInCents = Math.round(lesson.price * 100)
        const { platformFee, instructorAmount } = calculateFees(amountInCents)

        // Convert back to dollars for database storage
        const platformFeeAmount = platformFee / 100
        const instructorPayoutAmount = instructorAmount / 100

        // Create a purchase record with fee details
        const { error } = await supabase.from("purchases").insert({
          user_id: userId,
          video_id: videoId || null, // May be null for lesson purchases
          lesson_id: lessonId,
          stripe_payment_id: session.payment_intent,
          amount: lesson.price,
          instructor_payout_amount: instructorPayoutAmount,
          platform_fee_amount: platformFeeAmount,
          payout_status: "paid", // Since Stripe Connect handles the transfer automatically
        })

        if (error) {
          console.error("Error creating purchase record:", error)
          throw error
        }

        console.log(`Successfully processed lesson purchase for user ${userId}, lesson ${lessonId}`)
      } else if (videoId) {
        // Handle legacy video purchase
        // Fetch the video to get the price
        const { data: video, error: videoError } = await supabase
          .from("videos")
          .select("price, instructor_id")
          .eq("id", videoId)
          .single()

        if (videoError || !video) {
          throw new Error("Video not found")
        }

        // For legacy purchases, we'll still calculate the split but may not have a Connect account
        const amountInCents = Math.round(video.price * 100)
        const { platformFee, instructorAmount } = calculateFees(amountInCents)

        // Convert back to dollars for database storage
        const platformFeeAmount = platformFee / 100
        const instructorPayoutAmount = instructorAmount / 100

        // Create a purchase record
        const { error } = await supabase.from("purchases").insert({
          user_id: userId,
          video_id: videoId,
          stripe_payment_id: session.payment_intent,
          amount: video.price,
          lesson_id: null,
          instructor_payout_amount: instructorPayoutAmount,
          platform_fee_amount: platformFeeAmount,
          payout_status: "pending", // May need manual processing for legacy purchases
        })

        if (error) {
          throw error
        }
      } else {
        throw new Error("Missing product ID in metadata")
      }

      // Here you could send a confirmation email to the user
      // For simplicity, we're skipping that part in this implementation
    } catch (error: any) {
      console.error("Error processing webhook:", error)
      return NextResponse.json({ message: `Webhook processing error: ${error.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}

// This is important for webhook endpoints in Next.js
export const config = {
  api: {
    bodyParser: false,
  },
}

