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

    // Extract metadata
    const lessonId = session.metadata?.lessonId
    const userId = session.metadata?.userId
    const stripeProductId = session.metadata?.stripeProductId
    const stripePriceId = session.metadata?.stripePriceId
    const instructorPayoutAmount = session.metadata?.instructorPayoutAmount ? 
      parseInt(session.metadata.instructorPayoutAmount) / 100 : null

    if (!lessonId || !userId) {
      console.error("Missing metadata in checkout session", session.id)
      return NextResponse.json({ received: true })
    }

    // Record the purchase in the database
    const { error: purchaseError } = await supabase.from("purchases").insert({
      user_id: userId,
      lesson_id: lessonId,
      stripe_payment_id: session.payment_intent as string,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePriceId,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      instructor_payout_amount: instructorPayoutAmount,
    })

    if (purchaseError) {
      console.error("Error recording purchase:", purchaseError)
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

