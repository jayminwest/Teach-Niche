export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { stripe, calculateFees } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import Stripe from "stripe"

const DUMMY_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co"
const DUMMY_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key_for_build_process"

// Initialize Supabase client with service role for admin access
// Correctly use the real environment variables for both production and development
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DUMMY_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || DUMMY_SERVICE_KEY
)

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
    // Use type assertion to handle all Stripe event types
    switch (event.type as string) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        
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
        const amountInCents = session.amount_total || 0
        const { platformFee, instructorAmount } = calculateFees(amountInCents)
        const instructorPayoutAmount = instructorAmount / 100 // Convert back to dollars
        
        // Set payout status to 'pending' since we're using Connect
        const payoutStatus = 'pending_transfer'
        const instructorId = session.metadata?.instructorId
        
        // Helper function to update instructor earnings - avoids duplicate code
        const updateInstructorEarnings = async (instructorId: string, amount: number) => {
          if (!instructorId) return
          
          try {
            // Get current earnings first
            const { data: instructorProfile } = await supabase
              .from("instructor_profiles")
              .select("total_earnings")
              .eq("user_id", instructorId)
              .single()
            
            const currentEarnings = instructorProfile?.total_earnings || 0
            const newEarnings = currentEarnings + amount
            
            const { error: instructorError } = await supabase
              .from("instructor_profiles")
              .update({
                total_earnings: newEarnings,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", instructorId)
            
            if (instructorError) {
              console.error("Error updating instructor earnings:", instructorError)
            }
          } catch (error) {
            console.error("Failed to update instructor earnings:", error)
          }
        }
        
        // Create purchase record
        if (lessonId) {
          // This is a lesson purchase
          try {
            // Create purchase data 
            const purchaseData = {
              user_id: userId,
              lesson_id: lessonId,
              stripe_payment_id: session.id,
              amount: amount,
              instructor_payout_amount: instructorPayoutAmount,
              platform_fee_amount: platformFee / 100, // Convert to dollars
              payout_status: payoutStatus,
              stripe_product_id: session.metadata?.productId,
              stripe_price_id: session.metadata?.priceId,
              is_free: amount === 0
            }
            
            const { error: purchaseError } = await supabase
              .from("purchases")
              .insert(purchaseData)
            
            if (purchaseError) {
              console.error("Error recording lesson purchase:", purchaseError)
            } else if (instructorId && amount > 0) {
              // Only update earnings for paid purchases
              await updateInstructorEarnings(instructorId, instructorPayoutAmount)
            }
          } catch (error) {
            console.error("Error processing lesson purchase:", error)
          }
        } else if (videoId) {
          // This is a video purchase
          try {
            const { error: purchaseError } = await supabase
              .from("purchases")
              .insert({
                user_id: userId,
                video_id: videoId,
                stripe_payment_id: session.id,
                amount: amount,
                instructor_payout_amount: instructorPayoutAmount,
                platform_fee_amount: platformFee / 100, // Convert to dollars
                payout_status: payoutStatus,
                stripe_product_id: session.metadata?.productId,
                stripe_price_id: session.metadata?.priceId,
                is_free: amount === 0
              })
            
            if (purchaseError) {
              console.error("Error recording video purchase:", purchaseError)
            } else if (instructorId && amount > 0) {
              // Only update earnings for paid purchases
              await updateInstructorEarnings(instructorId, instructorPayoutAmount)
            }
          } catch (error) {
            console.error("Error processing video purchase:", error)
          }
        }
        
        break
      }
      
      // Handle transfer events
      case "transfer.created" as string: {
        const transfer = event.data.object as Stripe.Transfer
        
        // Get the payment intent ID from the transfer
        const paymentIntentId = transfer.source_transaction
        
        if (paymentIntentId) {
          // Find the purchase with this payment intent
          const { data: purchases, error: purchaseError } = await supabase
            .from("purchases")
            .select("id")
            .eq("stripe_payment_id", paymentIntentId)
            .limit(1)
          
          if (purchaseError || !purchases || purchases.length === 0) {
            console.error("Could not find purchase for transfer:", purchaseError)
            break
          }
          
          // Update the purchase with the transfer information
          const { error: updateError } = await supabase
            .from("purchases")
            .update({
              payout_status: 'transferred',
              stripe_transfer_id: transfer.id
            })
            .eq("id", purchases[0].id)
          
          if (updateError) {
            console.error("Error updating purchase with transfer info:", updateError)
          }
        }
        
        break
      }
      
      // Handle transfer failures
      case "transfer.failed" as string: {
        const transfer = event.data.object as Stripe.Transfer
        
        // Get the payment intent ID from the transfer
        const paymentIntentId = transfer.source_transaction
        
        if (paymentIntentId) {
          // Find the purchase with this payment intent
          const { data: purchases, error: purchaseError } = await supabase
            .from("purchases")
            .select("id")
            .eq("stripe_payment_id", paymentIntentId)
            .limit(1)
          
          if (purchaseError || !purchases || purchases.length === 0) {
            console.error("Could not find purchase for failed transfer:", purchaseError)
            break
          }
          
          // Update the purchase with the failure information
          const { error: updateError } = await supabase
            .from("purchases")
            .update({
              payout_status: 'failed',
              stripe_transfer_id: transfer.id
            })
            .eq("id", purchases[0].id)
          
          if (updateError) {
            console.error("Error updating purchase with transfer failure:", updateError)
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

