"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function StripeConnectSuccess() {
  const [loading, setLoading] = useState(true)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccountStatus = async () => {
      try {
        setLoading(true)
        // Fetch the latest account status
        const response = await fetch("/api/stripe/account-status")

        if (!response.ok) {
          throw new Error("Failed to fetch account status")
        }

        const data = await response.json()
        setAccountStatus(data)
      } catch (error) {
        console.error("Error checking account status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAccountStatus()
  }, [])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verifying Your Account</CardTitle>
            <CardDescription>Please wait while we verify your Stripe Connect account...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle>Stripe Connect Setup {accountStatus?.onboardingComplete ? "Complete" : "In Progress"}</CardTitle>
          <CardDescription>
            {accountStatus?.onboardingComplete
              ? "Your Stripe Connect account has been successfully set up!"
              : "Your Stripe Connect account has been created, but there are still some steps to complete."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          {accountStatus?.onboardingComplete ? (
            <p className="mb-4 text-muted-foreground">
              You can now receive payments for your lessons. The platform fee is 15%, and you'll receive 85% of each
              purchase.
            </p>
          ) : (
            <p className="mb-4 text-muted-foreground">
              Please complete all the required steps in your Stripe Connect account to start receiving payments.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" asChild>
            <Link href="/dashboard/stripe-connect">
              {accountStatus?.onboardingComplete ? "Manage Stripe Connect" : "Complete Stripe Setup"}
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

