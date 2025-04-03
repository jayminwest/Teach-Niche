import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"

// This route is kept for backward compatibility
// It redirects to the lesson checkout flow since videos are now part of lessons
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, price, title } = body
    
    // If we have a videoId, try to find its associated lesson
    if (videoId) {
      // Redirect to the lesson checkout with the same parameters but using lessonId
      return NextResponse.json(
        { 
          message: "Video checkout is deprecated. Please use lesson checkout instead.",
          redirectUrl: `/api/checkout-lesson?lessonId=${videoId}&price=${price}&title=${encodeURIComponent(title)}`
        },
        { status: 308 } // Permanent Redirect status code
      )
    }
    
    // If no videoId or cannot determine the lesson, return a gone status
    return NextResponse.json(
      { message: "Video checkout is deprecated. Please use lesson checkout instead." },
      { status: 410 } // Gone status code
    )
  } catch (error: any) {
    console.error("Error in checkout-video route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
