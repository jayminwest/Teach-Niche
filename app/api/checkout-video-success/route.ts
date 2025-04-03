import { NextRequest, NextResponse } from "next/server"
import { redirect } from "next/navigation"

// Redirect old video success routes to the lesson success page
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")
  
  // Redirect to the lesson success page
  return redirect(`/checkout/lesson-success?session_id=${sessionId}`);
}
