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
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        
        // Check if this is a video or lesson purchase
        const lessonId = session.metadata?.lessonId
        const videoId = session.metadata?.videoId
        const userId = session.metadata?.userId
        
        if (!userId) {
          console.error("No user ID in session metadata")
          return NextResponse.json({ error: "No user ID found" }, { status: 400 })
        }
        
        // Calculate platform fee and instructor amount
        const amount = session.amount_total ? session.amount_total / 100 : 0
        const { platformFee, instructorAmount } = calculateFees(amount)
        
        if (lessonId) {
          // This is a lesson purchase
          const { error: purchaseError } = await supabase
            .from("purchases")
            .insert({
              user_id: userId,
              lesson_id: lessonId,
              video_id: null, // Explicitly set video_id to null
              stripe_payment_id: session.id,
              amount: amount,
              instructor_payout_amount: instructorAmount,
              stripe_product_id: session.metadata?.productId,
              stripe_price_id: session.metadata?.priceId,
            })
          
          if (purchaseError) {
            console.error("Error recording lesson purchase:", purchaseError)
          }
          
          // If there's an instructor ID, update their earnings
          const instructorId = session.metadata?.instructorId
          if (instructorId) {
            const { error: instructorError } = await supabase
              .from("instructor_profiles")
              .upsert({
                user_id: instructorId,
                total_earnings: instructorAmount,
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              })
            
            if (instructorError) {
              console.error("Error updating instructor earnings:", instructorError)
            }
          }
        } else if (videoId) {
          // This is a video purchase
          const { error: purchaseError } = await supabase
            .from("purchases")
            .insert({
              user_id: userId,
              video_id: videoId,
              stripe_payment_id: session.id,
              amount: amount,
              instructor_payout_amount: instructorAmount,
              stripe_product_id: session.metadata?.productId,
              stripe_price_id: session.metadata?.priceId,
            })
          
          if (purchaseError) {
            console.error("Error recording video purchase:", purchaseError)
          }
          
          // If there's an instructor ID, update their earnings
          const instructorId = session.metadata?.instructorId
          if (instructorId) {
            const { error: instructorError } = await supabase
              .from("instructor_profiles")
              .upsert({
                user_id: instructorId,
                total_earnings: instructorAmount,
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false
              })
            
            if (instructorError) {
              console.error("Error updating instructor earnings:", instructorError)
            }
          }
        }
        
        break
      }
      
      // Handle other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error(`Webhook error: ${error.message}`)
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    )
  }
}

// This is important for webhook endpoints in Next.js
export const config = {
  api: {
    bodyParser: false,
  },
}

