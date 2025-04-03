"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Loader2, Upload } from "lucide-react"
import { getVideoExtension, isValidVideoFormat, isValidVideoSize } from "@/lib/utils"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UploadContent() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showSetupLink, setShowSetupLink] = useState(false)
  const [isLesson, setIsLesson] = useState(false)
  const [stripeConnectStatus, setStripeConnectStatus] = useState<any>(null)
  const [checkingStripeStatus, setCheckingStripeStatus] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const searchParams = useSearchParams()
  const typeFromUrl = searchParams.get("type")
  const lessonIdFromUrl = searchParams.get("lessonId")

  // Set isLesson to true if type=lesson in the URL
  useEffect(() => {
    if (typeFromUrl === "lesson") {
      setIsLesson(true)
    }
  }, [typeFromUrl])

  // Check Stripe Connect status
  useEffect(() => {
    const checkStripeStatus = async () => {
      try {
        setCheckingStripeStatus(true)
        const response = await fetch("/api/stripe/account-status")

        if (!response.ok) {
          throw new Error("Failed to fetch Stripe account status")
        }

        const data = await response.json()
        setStripeConnectStatus(data)
      } catch (error) {
        console.error("Error checking Stripe status:", error)
      } finally {
        setCheckingStripeStatus(false)
      }
    }

    checkStripeStatus()
  }, [])

  const generateThumbnail = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error("Video or canvas element not available"))
        return
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        reject(new Error("Canvas context not available"))
        return
      }

      // Set dimensions
      canvas.width = 640
      canvas.height = 360

      // Draw the video frame at 1 second mark
      video.currentTime = 1
      video.addEventListener(
        "seeked",
        () => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Failed to generate thumbnail"))
              }
            },
            "image/jpeg",
            0.7,
          )
        },
        { once: true },
      )

      video.addEventListener(
        "error",
        (e) => {
          reject(new Error("Error seeking video: " + e))
        },
        { once: true },
      )
    })
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const extension = getVideoExtension(file.name)

    if (!isValidVideoFormat(extension)) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a video in MP4, MOV, AVI, or WEBM format.",
      })
      return
    }

    if (!isValidVideoSize(file.size)) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "The maximum file size is 500MB.",
      })
      return
    }

    setVideoFile(file)

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload an image file.",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "The maximum file size is 5MB.",
      })
      return
    }

    setThumbnailFile(file)

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file)
    setThumbnailPreview(objectUrl)

    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      toast({
        variant: "destructive",
        title: "No video selected",
        description: "Please select a video to upload.",
      })
      return
    }

    // Check if Stripe Connect is required and set up
    if (isLesson && !stripeConnectStatus?.accountEnabled) {
      toast({
        variant: "destructive",
        title: "Stripe Connect Required",
        description: "You need to complete your Stripe Connect setup before creating paid lessons.",
      })
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // 1. Upload the video file
      const videoFileName = `${Date.now()}-${videoFile.name}`
      const { data: videoData, error: videoError } = await supabase.storage
        .from("videos")
        .upload(`${user.id}/${videoFileName}`, videoFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100
            setUploadProgress(percentage)
          },
        })

      if (videoError) {
        throw videoError
      }

      // 2. Generate or use provided thumbnail
      let thumbnailUrl = null

      // If a thumbnail file was uploaded, use that
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.name}`
        const { data: thumbnailData, error: thumbnailError } = await supabase.storage
          .from("thumbnails")
          .upload(`${user.id}/${thumbnailFileName}`, thumbnailFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (thumbnailError) {
          console.error("Error uploading thumbnail:", thumbnailError)
          // Continue without thumbnail if upload fails
        } else {
          // Get public URL
          const { data: publicThumbnailUrl } = await supabase.storage
            .from("thumbnails")
            .getPublicUrl(`${user.id}/${thumbnailFileName}`)

          thumbnailUrl = publicThumbnailUrl.publicUrl
        }
      }
      // Otherwise try to generate one from the video
      else if (videoRef.current && previewUrl) {
        try {
          const thumbnailBlob = await generateThumbnail()
          const thumbnailFileName = `${Date.now()}-thumbnail.jpg`

          const { data: thumbnailData, error: thumbnailError } = await supabase.storage
            .from("thumbnails")
            .upload(`${user.id}/${thumbnailFileName}`, thumbnailBlob, {
              cacheControl: "3600",
              upsert: false,
              contentType: "image/jpeg",
            })

          if (thumbnailError) {
            console.error("Error uploading thumbnail:", thumbnailError)
            // Continue without thumbnail if upload fails
          } else {
            // Get public URL
            const { data: publicThumbnailUrl } = await supabase.storage
              .from("thumbnails")
              .getPublicUrl(`${user.id}/${thumbnailFileName}`)

            thumbnailUrl = publicThumbnailUrl.publicUrl
          }
        } catch (error) {
          console.error("Error generating thumbnail:", error)
          // Continue without thumbnail if generation fails
        }
      }

      // Get video public URL
      const { data: publicVideoUrl } = await supabase.storage.from("videos").getPublicUrl(`${user.id}/${videoFileName}`)

      // 3. Create Stripe product and price for the lesson
      const priceInCents = Math.round(Number.parseFloat(price) * 100);
      const response = await fetch("/api/stripe/create-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: title,
          description: description,
          price: priceInCents,
          images: thumbnailUrl ? [thumbnailUrl] : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Stripe product");
      }

      const { productId, priceId } = await response.json();

      // 4. Create content in database
      if (isLesson) {
        // Create a parent lesson
        const { data: lesson, error: lessonError } = await supabase
          .from("lessons")
          .insert({
            title,
            description,
            price: Number.parseFloat(price),
            instructor_id: user.id,
            thumbnail_url: thumbnailUrl,
            video_url: publicVideoUrl.publicUrl,
            stripe_product_id: productId,
            stripe_price_id: priceId,
          })
          .select()

        if (lessonError) throw lessonError

        toast({
          title: "Success",
          description: "Your lesson has been created successfully.",
        })
      } else if (lessonIdFromUrl) {
        // Add video as a child lesson to existing parent lesson
        const { error: videoDbError } = await supabase.from("lessons").insert({
          title,
          description,
          price: Number.parseFloat(price),
          instructor_id: user.id,
          video_url: publicVideoUrl.publicUrl,
          thumbnail_url: thumbnailUrl,
          parent_lesson_id: lessonIdFromUrl,
          stripe_product_id: productId,
          stripe_price_id: priceId,
        })

        if (videoDbError) throw videoDbError

        toast({
          title: "Success",
          description: "Your video has been added to the lesson successfully.",
        })
      } else {
        // Create a new lesson with video
        const { error: dbError } = await supabase.from("lessons").insert({
          title,
          description,
          price: Number.parseFloat(price),
          instructor_id: user.id,
          video_url: publicVideoUrl.publicUrl,
          thumbnail_url: thumbnailUrl,
          stripe_product_id: productId,
          stripe_price_id: priceId,
        })

        if (dbError) throw dbError

        toast({
          title: "Success",
          description: "Your lesson has been created successfully.",
        })
      }

      // Redirect to dashboard
      if (lessonIdFromUrl) {
        router.push(`/dashboard/lessons/${lessonIdFromUrl}`)
      } else {
        router.push("/dashboard")
      }
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload content. Please try again.",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upload Content</h1>
        <p className="text-muted-foreground">Share your kendama expertise with students around the world</p>
      </div>


      {isLesson && !checkingStripeStatus && !stripeConnectStatus?.accountEnabled && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stripe Connect Required</AlertTitle>
          <AlertDescription>
            Before creating paid lessons, you need to set up your Stripe Connect account to receive payments.{" "}
            <Link href="/dashboard/stripe-connect" className="font-medium underline">
              Set up Stripe Connect
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>Fill out the information below to upload your tutorial content</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isLesson
                    ? "e.g., Beginner Kendama Fundamentals"
                    : "e.g., Beginner Kendama Tricks: Mastering the Basics"
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this tutorial..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={isLesson ? "19.99" : "9.99"}
                min="0.99"
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground">
                Set a fair price for your {isLesson ? "lesson" : "tutorial"} (minimum $0.99)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail Image (Optional)</Label>
              <div className="border rounded-md p-4">
                {thumbnailPreview ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setThumbnailFile(null)
                        setThumbnailPreview(null)
                      }}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="mb-4">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your thumbnail image here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Recommended: 16:9 aspect ratio, JPG or PNG (max 5MB)
                    </p>
                    <Button type="button" variant="outline" asChild>
                      <label>
                        <input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleThumbnailChange}
                        />
                        Select Image
                      </label>
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                If you don't upload a thumbnail, we'll generate one from your video
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">Video File</Label>
              <div className="border rounded-md p-4">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <video ref={videoRef} src={previewUrl} className="w-full h-full object-contain" controls />
                    </div>
                    <p className="text-sm">
                      {videoFile?.name} ({(videoFile?.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setVideoFile(null)
                        setPreviewUrl(null)
                      }}
                    >
                      Change Video
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="mb-4">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your video file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Supported formats: MP4, MOV, AVI, WEBM (max 500MB)
                    </p>
                    <Button type="button" variant="outline" asChild>
                      <label>
                        <input
                          id="video"
                          type="file"
                          accept="video/*"
                          className="sr-only"
                          onChange={handleVideoChange}
                        />
                        Select Video
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Hidden canvas for thumbnail generation */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={uploading || !videoFile || (isLesson && !stripeConnectStatus?.accountEnabled)}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading ({uploadProgress.toFixed(0)}%)
                </>
              ) : (
                `Upload ${isLesson ? "Lesson" : "Video"}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

