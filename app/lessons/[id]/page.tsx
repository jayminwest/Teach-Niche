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
import { VideoPlayer } from "@/components/video-player"

import { Metadata } from 'next' 

// Define proper types for the params
type PageParams = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Define props inline for generateMetadata with proper typing
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const lessonId = params.id;
  const supabase = await createServerClient();
  
  // Fetch lesson title for metadata
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", lessonId)
    .single();
    
  return {
    title: lesson?.title ? `Lesson: ${lesson.title}` : 'Lesson Details',
  }
}

// Define props inline for the Page component with proper typing
export default async function LessonDetail({ 
  params, 
  searchParams 
}: PageParams) {
  const supabase = await createServerClient()
  
  // Get the lesson ID from params
  const lessonId = params.id

  // Get the current session - properly awaited
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Use getUser for more secure authentication
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the lesson with proper error handling
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single()
  
  if (error || !lesson) {
    console.error("Error fetching lesson:", error)
    notFound()
  }
  
  // Extract the video filename if it's a path
  if (lesson?.video_url && typeof lesson.video_url === 'string') {
    try {
      // If the URL contains a path structure, extract just the filename
      if (lesson.video_url.includes('/')) {
        const parts = lesson.video_url.split('/');
        const filename = parts[parts.length - 1];
        
        // If we have a filename and it doesn't contain query parameters
        if (filename && !filename.includes('?')) {
          console.log("Extracted filename from URL:", filename);
          lesson.video_url = filename;
        }
      }
      
      // If it's a URL, try to refresh it
      if (lesson.video_url.startsWith('http')) {
        try {
          const refreshedUrl = await refreshVideoUrl(lesson.video_url);
          if (refreshedUrl) {
            lesson.video_url = refreshedUrl;
          }
        } catch (refreshError) {
          console.error("Error refreshing URL:", refreshError);
          // Keep the original URL if refresh fails
        }
      }
    } catch (error) {
      console.error("Error processing video URL:", error);
      // Keep the original URL if processing fails
    }
  }

  // Fetch instructor information separately if needed
  let instructorName = "Instructor"
  if (lesson?.instructor_id) {
    // Try to get instructor profile first
    const { data: instructorProfile } = await supabase
      .from("instructor_profiles")
      .select("*")
      .eq("user_id", lesson.instructor_id)
      .single()
    
    // Use instructor profile name if available
    if (instructorProfile?.name) {
      instructorName = instructorProfile.name;
    } else {
      // Then try to get user data from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(lesson.instructor_id)
      
      if (authUser?.user) {
        // Extract name from email if available (before the @ symbol)
        if (authUser.user.email) {
          const emailParts = authUser.user.email.split('@');
          instructorName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
        }
        
        // Use user metadata name if available
        if (authUser.user.user_metadata?.full_name) {
          instructorName = authUser.user.user_metadata.full_name;
        }
      }
    }
  }

  // Removed fetching of child/legacy videos

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
      <div className="mb-6 p-4 border rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Instructor: {instructorName}</span>
            <span>•</span>
            <span>Created on {createdDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-2xl font-bold">{formatPrice(lesson.price)}</p>
          
          {!user ? (
            <Button asChild>
              <Link href={`/auth/sign-in?redirectedFrom=/lessons/${lesson.id}`}>Sign in to purchase</Link>
            </Button>
          ) : isInstructor ? (
            <div className="px-3 py-2 bg-muted rounded-md text-sm">
              <p>This is your lesson</p>
            </div>
          ) : hasPurchased ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm">You own this lesson</p>
            </div>
          ) : (
            <LessonCheckoutButton lessonId={lesson.id} price={lesson.price} title={lesson.title} />
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        <div>
          <div className="mb-4 relative rounded-lg overflow-hidden border">
            {(hasPurchased || isInstructor) && lesson.video_url ? (
              <VideoPlayer 
                initialVideoUrl={lesson.video_url} 
                lessonId={lesson.id}
                title={lesson.title}
              />
            ) : (
              <div className="aspect-video relative">
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
              </div>
            )}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-2">About this lesson</h2>
            <p className="text-muted-foreground">{lesson.description || "No description provided."}</p>
          </div>

          {/* Removed Lesson Videos section */}
          
        </div>
      </div>
    </div>
  )
}

