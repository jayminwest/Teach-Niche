"use client"

import React, { useEffect, useState } from "react" // Import React
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Edit, Eye, Loader2, Plus, Trash } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"

// Define props type for Client Component page
interface ManageLessonProps {
  params: { id: string };
}

// Define as a React Functional Component
const ManageLesson: React.FC<ManageLessonProps> = (props) => {
  const { params } = props; // Destructure params here
  const [lesson, setLesson] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingVideo, setDeletingVideo] = useState<any>(null)
  const [deletingLesson, setDeletingLesson] = useState(false)
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/sign-in")
          return
        }

        // Fetch the lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .eq("id", params.id)
          .single()

        if (lessonError || !lessonData) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Lesson not found",
          })
          router.push("/dashboard")
          return
        }

        // Check if user is the instructor
        if (lessonData.instructor_id !== user.id) {
          toast({
            variant: "destructive",
            title: "Unauthorized",
            description: "You don't have permission to manage this lesson",
          })
          router.push("/dashboard")
          return
        }

        setLesson(lessonData)

        // Fetch child lessons (videos) in this lesson
        const { data: videosData, error: videosError } = await supabase
          .from("lessons")
          .select("*")
          .eq("parent_lesson_id", params.id)
          .order("created_at", { ascending: true })

        if (videosError) {
          console.error("Error fetching videos:", videosError)
        } else {
          setVideos(videosData || [])
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load lesson data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [supabase, params.id, router, toast])

  const handleRemoveVideo = async (videoId: string) => {
    try {
      // Update the child lesson to remove its parent (making it standalone)
      const { error } = await supabase.from("lessons").update({ parent_lesson_id: null }).eq("id", videoId)

      if (error) throw error

      // Update local state
      setVideos(videos.filter((video) => video.id !== videoId))

      toast({
        title: "Success",
        description: "Video removed from lesson",
      })

      setDeleteDialogOpen(false)
      setDeletingVideo(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove video from lesson",
      })
    }
  }

  const handleDeleteLesson = async () => {
    try {
      setDeletingLesson(true)

      // First, remove parent_lesson_id from all child lessons
      const { error: videosError } = await supabase
        .from("lessons")
        .update({ parent_lesson_id: null })
        .eq("parent_lesson_id", params.id)

      if (videosError) throw videosError

      // Then delete the lesson
      const { error: lessonError } = await supabase.from("lessons").delete().eq("id", params.id)

      if (lessonError) throw lessonError

      toast({
        title: "Success",
        description: "Lesson deleted successfully",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete lesson",
      })
      setDeletingLesson(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading lesson data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage Lesson</h1>
          <p className="text-muted-foreground">Add, remove, and organize videos in your lesson</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/lessons/${params.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/lessons/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteLessonDialogOpen(true)}>
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative rounded-md overflow-hidden border">
                <Image
                  src={lesson.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <p className="text-muted-foreground mt-1 line-clamp-3">{lesson.description || "No description"}</p>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{formatPrice(lesson.price)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{format(new Date(lesson.created_at), "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Videos:</span>
                  <span>{videos.length}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/lessons/${params.id}/edit`}>Edit Lesson Details</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Videos in this Lesson</CardTitle>
                <CardDescription>Manage the videos included in this lesson</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/dashboard/upload?lessonId=${params.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload New Video
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-16 w-28 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={video.thumbnail_url || "/placeholder.svg?height=100&width=160"}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium">{video.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {video.description || "No description"}
                        </p>
                        <p className="text-sm mt-1">{formatPrice(video.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/videos/${video.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingVideo(video)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                  <h3 className="text-xl font-semibold mb-2">No videos in this lesson yet</h3>
                  <p className="text-muted-foreground mb-6">Upload videos or add existing ones to this lesson</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <Link href={`/dashboard/upload?lessonId=${params.id}`}>Upload New Video</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/add-videos-to-lesson">Add Existing Videos</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard/add-videos-to-lesson">Add Existing Videos</Link>
              </Button>
              <Button asChild>
                <Link href={`/dashboard/upload?lessonId=${params.id}`}>Upload New Video</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Dialog for removing a video from the lesson */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Video from Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this video from the lesson? The video will still exist in your account,
              but it will no longer be part of this lesson.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-16 w-28 relative rounded overflow-hidden flex-shrink-0">
              <Image
                src={deletingVideo?.thumbnail_url || "/placeholder.svg?height=100&width=160"}
                alt={deletingVideo?.title || "Video"}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
            <div>
              <h3 className="font-medium">{deletingVideo?.title}</h3>
              <p className="text-sm text-muted-foreground">{formatPrice(deletingVideo?.price || 0)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deletingVideo && handleRemoveVideo(deletingVideo.id)}>
              Remove Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for deleting the lesson */}
      <Dialog open={deleteLessonDialogOpen} onOpenChange={setDeleteLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lesson? This action cannot be undone. Videos in this lesson will not
              be deleted, but they will no longer be part of this lesson.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-lg bg-destructive/10">
            <h3 className="font-medium">{lesson?.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{videos.length} videos in this lesson</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLessonDialogOpen(false)} disabled={deletingLesson}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLesson} disabled={deletingLesson}>
              {deletingLesson ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Lesson"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManageLesson; // Export the component

