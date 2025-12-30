import { createRouteHandlerClient } from "@/lib/supabase/route-handler"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createRouteHandlerClient()

    // Create videos bucket if it doesn't exist
    const { data: videoBucket, error: videoError } = await supabase.storage.createBucket("videos", {
      public: false,
      fileSizeLimit: 524288000, // 500MB in bytes
    })

    // Create thumbnails bucket if it doesn't exist
    const { data: thumbnailBucket, error: thumbnailError } = await supabase.storage.createBucket("thumbnails", {
      public: true,
      fileSizeLimit: 5242880, // 5MB in bytes
    })

    return NextResponse.json({
      success: true,
      videoBucket: videoBucket || "Bucket may already exist",
      thumbnailBucket: thumbnailBucket || "Bucket may already exist",
      videoError,
      thumbnailError,
    })
  } catch (error: any) {
    console.error("Error setting up storage:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        error,
      },
      { status: 500 },
    )
  }
}
