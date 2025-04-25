"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import ManualInstructions from "./manual-instructions"
import Link from "next/link"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const setupStorage = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/setup-storage")
      const data = await response.json()

      setResult(data)

      if (data.success) {
        toast({
          title: "Success",
          description:
            "Storage buckets have been set up successfully. Please follow the manual instructions below to set up RLS policies.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to set up storage buckets. Please follow the manual instructions below.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred. Please follow the manual instructions below.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Setup</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Storage Setup</CardTitle>
          <CardDescription>Set up the storage buckets required for video uploads and thumbnails</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This will attempt to create the necessary storage buckets in Supabase. After creating the buckets, you&apos;ll
            need to manually set up the RLS policies following the instructions below.
          </p>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <div className="flex items-center mb-2">
                <span className="font-semibold mr-2">Status:</span>
                {result.success ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> Success
                  </span>
                ) : (
                  <span className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-1" /> Failed
                  </span>
                )}
              </div>

              <div className="mt-2">
                <p className="font-semibold">Details:</p>
                <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={setupStorage} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              "Create Storage Buckets"
            )}
          </Button>
        </CardFooter>
      </Card>

      <ManualInstructions />

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          After completing the setup, you can return to the dashboard and try uploading videos again.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

