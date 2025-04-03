"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function UploadRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Check if there's a lessonId parameter to preserve it
    const lessonId = searchParams.get("lessonId")
    
    // Create the target URL with any relevant parameters
    let targetUrl = "/dashboard/create-lesson"
    if (lessonId) {
      targetUrl += `?lessonId=${lessonId}`
    }
    
    // Redirect to the create-lesson page
    router.push(targetUrl)
  }, [router, searchParams])

  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
      <p className="text-muted-foreground mb-6">
        The upload page has been replaced with our new lesson creation flow.
      </p>
    </div>
  )
}
