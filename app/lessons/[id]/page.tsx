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

// Updated for Next.js 15: params is now a Promise
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params; // Await the params Promise
  const lessonId = resolvedParams.id;
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

// Updated for Next.js 15: params and searchParams are now Promises
export default async function LessonDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createServerClient()
  
  // Await the params Promise before accessing its properties
  const resolvedParams = await params;
  const lessonId = resolvedParams.id;
  
  // Only log lesson ID in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Original lesson ID from params: ${lessonId}`);
  }

  // Note: searchParams would also need to be awaited if used directly

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
  
  // For video URLs, we'll pass them as-is to the VideoPlayer component
  // which will handle the path extraction and URL refreshing
  if (lesson?.video_url && typeof lesson.video_url === 'string') {
    try {
      // Only refresh HTTP URLs, leave file paths as-is for the VideoPlayer
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
      } else {
      }
    } catch (error) {
      console.error("Error processing video URL:", error);
      // Keep the original URL if processing fails
    }
  }

  // Fetch instructor information separately if needed
  let instructorName = "Instructor"
  if (lesson?.instructor_id) {
    // First try to get the name from the public.users table
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", lesson.instructor_id)
      .single();
    
    if (userData?.name) {
      instructorName = userData.name;
    } else {
      // Then try to get instructor profile
      const { data: instructorProfile } = await supabase
        .from("instructor_profiles")
        .select("name")
        .eq("user_id", lesson.instructor_id)
        .single();
      
      if (instructorProfile?.name) {
        instructorName = instructorProfile.name;
      } else {
        // Finally try to get user data from auth
        try {
          const { data: authUser } = await supabase.auth.admin.getUserById(lesson.instructor_id);
          
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
        } catch (err) {
          console.error("Error fetching auth user:", err);
        }
      }
    }
  }

  // Removed fetching of child/legacy videos

  // Check if the user has purchased this lesson
  let hasPurchased = false
  if (user) {
    // Only log in development environment
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) console.log(`Lesson page: checking if user ${user.id} has purchased lesson ${lessonId}`);
    
    // Enhanced purchase verification to ensure existing purchases are found
    let purchase = null;
    let purchaseError = null;
    
    try {
      // APPROACH 1: Direct exact match with eq()
      const result1 = await supabase
        .from("purchases")
        .select("id") // Only select the ID field, not the entire purchase record
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      
      if (result1.data) {
        purchase = result1.data;
        if (isDev) console.log("DEBUG: Found purchase via direct match");
      } else {
        // Try a more reliable Supabase function to check purchase
        try {
          // First attempt: Use a simple, direct query with .contains()
          const { data: simpleMatches, error: simpleMatchError } = await supabase
            .from("purchases")
            .select("id")
            .eq("user_id", user.id)
            .eq("lesson_id", lessonId);
            
          if (simpleMatchError) {
            if (isDev) console.log("DEBUG: Error with simple match:", simpleMatchError);
          }
          
          if (simpleMatches && simpleMatches.length > 0) {
            purchase = simpleMatches[0];
            if (isDev) console.log("DEBUG: Found purchase via simple match");
          } else {
            if (isDev) console.log("DEBUG: No purchase found via simple match, trying view query");
            
            // Second attempt: Query the view designed for this purpose
            const { data: viewMatches } = await supabase
              .from("user_purchased_lessons")
              .select("*")
              .eq("user_id", user.id)
              .eq("lesson_id", lessonId);
              
            if (viewMatches && viewMatches.length > 0) {
              purchase = { id: viewMatches[0].lesson_id }; // Create a simple object with lesson ID
              if (isDev) console.log("DEBUG: Found purchase via view match");
            } else {
              if (isDev) console.log("DEBUG: No purchase found via view match");
              
              // Last attempt: Check RPC function if available
              try {
                const { data: rpcResult } = await supabase.rpc(
                  'check_lesson_access',
                  { 
                    lesson_id: lessonId,
                    user_id: user.id
                  }
                );
                
                if (rpcResult === true) {
                  purchase = { id: 'rpc-verified' }; // Create a placeholder for RPC verification
                  if (isDev) console.log("DEBUG: Access verified via RPC function");
                }
              } catch (rpcError) {
                if (isDev) console.log("DEBUG: RPC function not available or error:", rpcError);
              }
            }
          }
        } catch (queryError) {
          if (isDev) console.error("Error in purchase verification queries:", queryError);
        }
      }
    } catch (e) {
      if (isDev) console.error("Error in purchase verification:", e);
      purchaseError = e;
    }

    if (purchaseError && isDev) {
      console.error("Error checking purchase:", purchaseError);
    }

    hasPurchased = !!purchase;
    if (isDev) console.log(`Has purchased: ${hasPurchased}`);
  }

  // Check if the user is the instructor
  const isInstructor = user?.id === lesson.instructor_id

  // Format the created date
  const createdDate = format(new Date(lesson.created_at), "MMMM d, yyyy")

  return (
    <div className="container py-8">
      <div className="mb-6 p-4 border rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Instructor: {instructorName}</span>
              <span className="hidden md:inline">•</span>
              <span>Created on {createdDate}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div>
              <p className="text-2xl font-bold">{formatPrice(lesson.price)}</p>
              {lesson.price > 0 && (
                <p className="text-xs text-muted-foreground -mt-1">plus processing fee</p>
              )}
            </div>
            
            {!user ? (
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/auth/sign-in?redirectedFrom=/lessons/${lesson.id}`}>Sign in to purchase</Link>
              </Button>
            ) : isInstructor ? (
              <div className="px-3 py-2 bg-muted rounded-md text-sm w-full sm:w-auto text-center">
                <p>This is your lesson</p>
              </div>
            ) : hasPurchased ? (
              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-muted rounded-md w-full sm:w-auto">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-sm">You own this lesson</p>
              </div>
            ) : (
              <div className="w-full sm:w-auto">
                <LessonCheckoutButton lessonId={lesson.id} price={lesson.price} title={lesson.title} />
              </div>
            )}
          </div>
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

          {/* Debug information section (only visible if there's a query param ?debug=true) */}
          {searchParams && (await searchParams).debug === 'true' && (
            <div className="mt-8 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold">Debug Information</h3>
              <div className="mt-2 bg-gray-100 p-3 rounded-md overflow-auto">
                <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
                <p><strong>Lesson ID:</strong> {lessonId}</p>
                <p><strong>Has Purchased:</strong> {hasPurchased ? 'Yes' : 'No'}</p>
                <p><strong>Is Instructor:</strong> {isInstructor ? 'Yes' : 'No'}</p>
                <details>
                  <summary className="cursor-pointer">Lesson Data</summary>
                  <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(lesson, null, 2)}</pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

