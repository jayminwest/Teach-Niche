export const dynamic = "force-dynamic"

import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"

/**
 * Admin-only route to migrate legacy video purchases to lesson purchases
 * This executes the handle_legacy_purchases procedure to fix inconsistencies
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure user is an admin
    const { userId, isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      )
    }
    
    const supabase = await createServerClient()
    
    // Execute the procedure to handle legacy purchases
    await supabase.rpc('handle_legacy_purchases')
    
    // Get stats about the updated purchases
    const { data: stats, error: statsError } = await supabase
      .from('purchases')
      .select('id, video_id, lesson_id', { count: 'exact' })
      .or('video_id.is.not.null,lesson_id.is.not.null')
    
    if (statsError) {
      console.error("Error fetching purchase stats:", statsError)
      return NextResponse.json(
        { error: "Failed to get purchase statistics after migration" },
        { status: 500 }
      )
    }
    
    const videoOnlyCount = stats?.filter(p => p.video_id && !p.lesson_id).length || 0
    const lessonOnlyCount = stats?.filter(p => !p.video_id && p.lesson_id).length || 0
    const bothCount = stats?.filter(p => p.video_id && p.lesson_id).length || 0
    
    return NextResponse.json({
      success: true,
      message: "Legacy purchase migration completed",
      stats: {
        totalPurchases: stats?.length || 0,
        videoOnlyCount,
        lessonOnlyCount,
        bothCount
      }
    })
  } catch (error: any) {
    console.error("Error in migrate-purchases API:", error)
    return NextResponse.json(
      { error: error.message || "Failed to migrate purchases" },
      { status: 500 }
    )
  }
}