"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface LessonCheckoutButtonProps {
  lessonId: string
  price: number
  title: string
}

export default function LessonCheckoutButton({ lessonId, price, title }: LessonCheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      setLoading(true)

      // Call our API to create a checkout session
      const response = await fetch("/api/checkout-lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          price,
          title,
        }),
      })

      let errorMessage = "Failed to create checkout session";
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="w-full" onClick={handleCheckout} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Lock className="mr-2 h-4 w-4" />
          Purchase Access
        </>
      )}
    </Button>
  )
}

