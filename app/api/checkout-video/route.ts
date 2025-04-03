import { NextRequest, NextResponse } from "next/server"

// This route is kept for backward compatibility
// It redirects to the lesson checkout flow since videos are now part of lessons
export async function POST(request: NextRequest) {
  try {
    // Just redirect to the main checkout route
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
