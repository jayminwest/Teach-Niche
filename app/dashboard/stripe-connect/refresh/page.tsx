"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function StripeConnectRefresh() {
  const router = useRouter()

  useEffect(() => {
    const refreshOnboarding = async () => {
      try {
        // Create a new onboarding link
        const response = await fetch("/api/stripe/create-connect-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to create new onboarding link")
        }

        const data = await response.json()

        // Redirect to Stripe onboarding
        if (data.url) {
          window.location.href = data.url
        } else {
          throw new Error("No onboarding URL returned")
        }
      } catch (error) {
        console.error("Error refreshing onboarding:", error)
        // Redirect to the Stripe Connect page if there's an error
        router.push("/dashboard/stripe-connect")
      }
    }

    // Start the refresh process after a short delay
    const timer = setTimeout(() => {
      refreshOnboarding()
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Refreshing Your Onboarding</CardTitle>
          <CardDescription>Please wait while we refresh your Stripe Connect onboarding session...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting to Stripe...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

