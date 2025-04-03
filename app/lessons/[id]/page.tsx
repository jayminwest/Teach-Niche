import { createServerClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"
import { refreshVideoUrl } from "@/lib/video-utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Lock, PlayCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import LessonCheckoutButton from "@/components/lesson-checkout-button"
import { format } from "date-fns"

export default async function LessonDetail({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = createServerClient()
  
  // Store the ID in a variable to avoid direct property access on params
  const lessonId = String(params?.id || '')

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user || null

  // Fetch the lesson without trying to join with instructor_id
  const { data: lesson, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single()
  
  if (error || !lesson) {
    console.error("Error fetching lesson:", error)
    notFound()
  }
  
  // Only try to refresh the video URL if it exists and is a valid URL
  if (lesson?.video_url && typeof lesson.video_url === 'string' && lesson.video_url.startsWith('http')) {
    try {
      const refreshedUrl = await refreshVideoUrl(lesson.video_url);
      if (refreshedUrl) {
        lesson.video_url = refreshedUrl;
      }
    } catch (refreshError) {
      console.error("Error refreshing lesson video URL:", refreshError);
      // Keep the original URL if refresh fails
    }
  }

  // Fetch instructor information separately if needed
  let instructorEmail = "Instructor"
  if (lesson?.instructor_id) {
    const { data: instructorData } = await supabase
      .from("users")
      .select("email")
      .eq("id", lesson.instructor_id)
      .single()

    if (instructorData) {
      instructorEmail = instructorData.email
    } else {
      // Fallback to auth.users if there's no users table
      const { data: authUser } = await supabase.auth.admin.getUserById(lesson.instructor_id)
      if (authUser?.user) {
        instructorEmail = authUser.user.email || "Instructor"
      }
    }
  }

  // Fetch videos in this lesson
  let { data: videos } = await supabase
    .from("lessons")
    .select("*")
    .eq("parent_lesson_id", lessonId)
    .order("created_at", { ascending: true })
  
  // If no videos found in the lessons table, try the videos table (for backward compatibility)
  if (!videos || videos.length === 0) {
    const { data: legacyVideos } = await supabase
      .from("videos")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: true })
    
    videos = legacyVideos;
  }

  // Check if the user has purchased this lesson
  let hasPurchased = false
  if (user) {
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle()

    if (purchaseError) {
      console.error("Error checking purchase:", purchaseError)
    }

    hasPurchased = !!purchase
  }

  // Check if the user is the instructor
  const isInstructor = user?.id === lesson.instructor_id

  // Format the created date
  const createdDate = format(new Date(lesson.created_at), "MMMM d, yyyy")

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-5">
        <div className="col-span-3">
          <div className="aspect-video mb-4 relative rounded-lg overflow-hidden border">
            {(hasPurchased || isInstructor) && lesson.video_url ? (
              <video 
                src={lesson.video_url} 
                controls 
                className="w-full h-full object-contain"
                poster={lesson.thumbnail_url || "/placeholder.svg?height=300&width=500"}
              />
            ) : (
              <>
                <Image
                  src={lesson.thumbnail_url || "/placeholder.svg?height=300&width=500"}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                />
                {!hasPurchased && !isInstructor && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="text-center p-4">
                      <Lock className="mx-auto h-12 w-12 mb-2 text-muted-foreground" />
                      <h3 className="text-xl font-bold mb-2">Purchase Required</h3>
                      <p className="text-muted-foreground mb-4">Purchase this lesson to access all videos</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <span>Instructor: {instructorEmail}</span>
            <span>•</span>
            <span>Created on {createdDate}</span>
            <span>•</span>
            <span>{videos?.length || 0} videos</span>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">About this lesson</h2>
            <p className="text-muted-foreground">{lesson.description || "No description provided."}</p>
          </div>

          {(hasPurchased || isInstructor) && videos && videos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lesson Videos</h2>
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="h-16 w-28 relative rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={video.thumbnail_url || "/placeholder.svg?height=100&width=160"}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{video.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {video.description || "No description"}
                      </p>
                    </div>
                    <Button asChild size="sm" className="flex-shrink-0">
                      <Link href={`/videos/${video.id}`}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Watch
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2">
          <div className="sticky top-6">
            <div className="border rounded-lg p-6">
              <p className="text-3xl font-bold mb-6">{formatPrice(lesson.price)}</p>

              {!user ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">Sign in to purchase this lesson</p>
                  <Button className="w-full" asChild>
                    <Link href={`/auth/sign-in?redirectedFrom=/lessons/${lesson.id}`}>Sign in</Link>
                  </Button>
                </div>
              ) : isInstructor ? (
                <div className="p-4 bg-muted rounded-md text-center">
                  <p>This is your lesson</p>
                </div>
              ) : hasPurchased ? (
                <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p>You own this lesson</p>
                </div>
              ) : (
                <LessonCheckoutButton lessonId={lesson.id} price={lesson.price} title={lesson.title} />
              )}

              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">This lesson includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{videos?.length || 0} HD video tutorials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Watch on any device</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

