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
  
  // Ensure lesson ID is a proper UUID string for database queries
  console.log(`Original lesson ID from params: ${lessonId}`);

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
    console.log(`Lesson page: checking if user ${user.id} has purchased lesson ${lessonId}`);
    
    // Get all purchases for this user for debugging
    const { data: allPurchases, error: allPurchasesError } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user.id);
      
    if (allPurchasesError) {
      console.error("Error fetching all purchases:", allPurchasesError);
    } else {
      console.log("All user purchases:", JSON.stringify(allPurchases));
    }
    
    // Force conversion to UUID string format to ensure proper comparison
    const uuidLessonId = lessonId.replace(/-/g, '').toLowerCase();
    console.log(`DEBUG: Normalized lesson ID: ${uuidLessonId}`);
    
    // Enhanced purchase verification to ensure existing purchases are found
    let purchase = null;
    let purchaseError = null;
    
    try {
      // Log for debugging
      console.log("DEBUG: Enhanced purchase verification starting");
      console.log(`DEBUG: User ID: ${user.id}, Lesson ID: ${lessonId}`);
      
      // APPROACH 1: Direct exact match with eq()
      const result1 = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
        
      console.log("Direct match result:", JSON.stringify(result1));
      
      if (result1.data) {
        console.log("DEBUG: Found direct match purchase");
        purchase = result1.data;
      } else {
        // APPROACH 2: Try using SQL LIKE for partial matches
        console.log("DEBUG: Trying SQL LIKE for partial matches");
        
        // PostgreSQL query to match partial lesson_id
        const { data: likeMatches } = await supabase
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .filter("lesson_id::text", "ilike", `%${lessonId.replace(/-/g, '')}%`);
          
        console.log("LIKE matches:", JSON.stringify(likeMatches));
          
        if (likeMatches && likeMatches.length > 0) {
          console.log("DEBUG: Found match with SQL LIKE");
          purchase = likeMatches[0];
        } else {
          // APPROACH 3: Manual comparison of all purchases
          console.log("DEBUG: Trying manual comparison of all purchases");
          
          // Get ALL purchases for this user
          const { data: allUserPurchases } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id);
            
          console.log("DEBUG: All user purchases:", JSON.stringify(allUserPurchases));
            
          // Try multiple string comparison methods
          const simplifiedLessonId = lessonId.replace(/-/g, '').toLowerCase();
          
          const matchingPurchase = allUserPurchases?.find(p => {
            if (!p.lesson_id) return false;
            
            // Convert to string and normalize for comparison
            const purchaseLessonId = typeof p.lesson_id === 'string' 
              ? p.lesson_id.replace(/-/g, '').toLowerCase() 
              : String(p.lesson_id).replace(/-/g, '').toLowerCase();
              
            console.log(`Comparing purchase ${p.id}: ${purchaseLessonId} with ${simplifiedLessonId}`);
            
            return purchaseLessonId.includes(simplifiedLessonId) || 
                   simplifiedLessonId.includes(purchaseLessonId);
          });
          
          if (matchingPurchase) {
            console.log("DEBUG: Found match with string comparison:", matchingPurchase);
            purchase = matchingPurchase;
          }
        }
      }
    } catch (e) {
      console.error("Error in purchase verification:", e);
      purchaseError = e;
    }

    if (purchaseError) {
      console.error("Error checking purchase:", purchaseError);
    } else {
      console.log("Purchase check result:", JSON.stringify(purchase));
    }

    hasPurchased = !!purchase;
    console.log(`Has purchased: ${hasPurchased}`);
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

