"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, Video as VideoIcon } from "lucide-react"
import Link from "next/link"

export default function CreateLesson() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a video
    if (!file.type.startsWith("video/")) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload a video file.",
      })
      return
    }

    // Check file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
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
    setVideoPreview(objectUrl)

    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      toast({
        variant: "destructive",
        title: "Video required",
        description: "Please upload a video for your lesson.",
      })
      return
    }

    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Upload thumbnail if provided
      let thumbnailUrl = null
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

      // Upload video file (required)
      const videoFileName = `${Date.now()}-${videoFile.name}`
      const { data: videoData, error: videoError } = await supabase.storage
        .from("videos")
        .upload(`${user.id}/${videoFileName}`, videoFile, {
          cacheControl: "3600",
          upsert: false,
        })

      if (videoError) {
        throw new Error(`Error uploading video: ${videoError.message}`)
      }

      // Get public URL for the video
      const { data: publicVideoUrl } = await supabase.storage
        .from("videos")
        .getPublicUrl(`${user.id}/${videoFileName}`)

      const videoUrl = publicVideoUrl.publicUrl

      // Create lesson entry in database
      const { data: lesson, error: dbError } = await supabase
        .from("lessons")
        .insert({
          title,
          description,
          price: Number.parseFloat(price),
          instructor_id: user.id,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl, // Required field in new data model
        })
        .select()

      if (dbError) throw dbError

      toast({
        title: "Success",
        description: "Your lesson has been created successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create lesson. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Lesson</h1>
        <p className="text-muted-foreground">Create a lesson to organize your kendama tutorial videos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Fill out the information below to create your lesson</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Beginner Kendama Fundamentals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this lesson..."
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
                placeholder="19.99"
                min="0.99"
                step="0.01"
                required
              />
              <p className="text-xs text-muted-foreground">Set a fair price for your lesson (minimum $0.99)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video" className="flex items-center">
                Video <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="border rounded-md p-4">
                {videoPreview ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setVideoFile(null)
                        setVideoPreview(null)
                      }}
                    >
                      Change Video
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="mb-4">
                      <VideoIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your video here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Accepted formats: MP4, MOV, WebM (max 500MB)
                    </p>
                    <Button type="button" variant="outline" asChild>
                      <label>
                        <input
                          id="video"
                          type="file"
                          accept="video/*"
                          className="sr-only"
                          onChange={handleVideoChange}
                          required
                        />
                        Select Video
                      </label>
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">A video is required for each lesson</p>
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Lesson"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
