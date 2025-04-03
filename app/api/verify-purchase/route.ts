import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = session.user

    // Get the session ID from the URL
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ message: "Missing session ID" }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (!stripeSession || stripeSession.payment_status !== "paid") {
      return NextResponse.json({ message: "Payment not confirmed" }, { status: 400 })
    }

    // Verify the user ID in the metadata matches
    if (stripeSession.metadata?.userId !== user.id) {
      return NextResponse.json({ message: "User mismatch" }, { status: 403 })
    }

    // Return the video ID
    return NextResponse.json({
      success: true,
      videoId: stripeSession.metadata?.videoId,
    })
  } catch (error: any) {
    console.error("Verification error:", error)
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 })
  }
}

