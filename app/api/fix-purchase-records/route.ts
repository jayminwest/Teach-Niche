export const dynamic = "force-dynamic"

import { createServerClient } from "@/lib/supabase/server"
import { stripe, calculateFees } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

// This is an admin-only endpoint to fix purchase records that were created before the fee calculation update
export async function GET(request: NextRequest) {
  try {
    // Get the API key from the request headers
    const apiKey = request.headers.get("x-api-key")
    
    // Check if the API key is valid (this is a simple implementation - use a more secure method in production)
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const supabase = await createServerClient()
    
    // Get all purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("*")
    
    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError)
      return NextResponse.json(
        { error: "Failed to fetch purchases" },
        { status: 500 }
      )
    }
    
    // Skip if no purchases found
    if (!purchases || purchases.length === 0) {
      return NextResponse.json(
        { message: "No purchases found" }
      )
    }
    
    console.log(`Found ${purchases.length} purchase records to check and fix`)
    
    // Track results
    const results = {
      total: purchases.length,
      updated: 0,
      skipped: 0,
      errors: 0
    }
    
    // Process each purchase
    for (const purchase of purchases) {
      try {
        // Skip free purchases
        if (purchase.is_free || purchase.amount === 0) {
          results.skipped++
          continue
        }
        
        // Calculate the correct platform fee and instructor payout amount
        const amountInCents = Math.round(Number(purchase.amount) * 100)
        const { platformFee, instructorAmount } = calculateFees(amountInCents)
        
        // Convert to dollars for database
        const platformFeeAmount = platformFee / 100
        const instructorPayoutAmount = instructorAmount / 100
        
        // Check if we need to update
        const shouldUpdate = 
          Math.abs(platformFeeAmount - purchase.platform_fee_amount) > 0.01 ||
          Math.abs(instructorPayoutAmount - (purchase.instructor_payout_amount || 0)) > 0.01
        
        if (shouldUpdate) {
          // Update the purchase record
          const { error: updateError } = await supabase
            .from("purchases")
            .update({
              platform_fee_amount: platformFeeAmount,
              instructor_payout_amount: instructorPayoutAmount,
              updated_at: new Date().toISOString()
            })
            .eq("id", purchase.id)
          
          if (updateError) {
            console.error(`Error updating purchase ${purchase.id}:`, updateError)
            results.errors++
          } else {
            results.updated++
          }
        } else {
          results.skipped++
        }
      } catch (error) {
        console.error(`Error processing purchase ${purchase.id}:`, error)
        results.errors++
      }
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Error fixing purchase records:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fix purchase records" },
      { status: 500 }
    )
  }
}