"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccess() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Verify the purchase was successful
    const verifyPurchase = async () => {
      if (!sessionId) {
        setError("Missing session ID")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/verify-purchase?session_id=${sessionId}`)
        if (!response.ok) {
          throw new Error("Failed to verify purchase")
        }

        const data = await response.json()
        setVideoId(data.videoId)
        setLoading(false)
      } catch (err) {
        setError("Failed to verify your purchase. Please contact support.")
        setLoading(false)
      }
    }

    verifyPurchase()
  }, [sessionId])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Processing Your Purchase</CardTitle>
            <CardDescription>Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Something Went Wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
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
          <CardTitle>Purchase Successful!</CardTitle>
          <CardDescription>Thank you for your purchase. You now have access to this tutorial video.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="mb-4 text-muted-foreground">
            Your purchase has been confirmed and you can now access the video in your library.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {videoId ? (
            <Button className="w-full" asChild>
              <Link href={`/videos/${videoId}`}>Watch Video Now</Link>
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link href="/library">Go to My Library</Link>
            </Button>
          )}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Explore More Tutorials</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

