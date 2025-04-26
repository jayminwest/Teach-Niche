import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import Image from "next/image"
import { AlertTriangle, CheckCircle, ExternalLink, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Lesson, Purchase, InstructorProfile } from "@/types/supabase" // Import the types
import { LessonCreationGuide } from "@/components/lesson-creation-guide"

// Extended purchase type with joined lesson data
type PurchaseWithLesson = Purchase & {
  lesson?: { title: string }
}

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/sign-in")
  }

  const user = session.user
  
  // Check if user has admin role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
    
  const isAdmin = userData?.role === 'admin'

  // Fetch lessons created by this instructor
  let lessons: Lesson[] = []; // Ensure lessons is typed
  try {
    // Fetch all lessons for the instructor, regardless of parent_lesson_id
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching lessons:", error.message);
    } else {
      lessons = data || [];
    }
  } catch (error) {
    console.error("Error fetching lessons:", error instanceof Error ? error.message : String(error));
  }

  // No need for child lessons, video counts, or standalone videos logic anymore

  
  // Get instructor profile and use stored total earnings if available
  // Get all purchases for the lessons created by this instructor
  let purchases: PurchaseWithLesson[] = [];
  
  try {
    // Get all lessons by this instructor
    const { data: allLessonsData, error: allLessonsError } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("instructor_id", user.id);
    
    if (allLessonsError) {
      console.error("Error fetching lesson IDs:", allLessonsError.message);
    } else {
      const lessonIds = allLessonsData.map(lesson => lesson.id);
      
      if (lessonIds.length > 0) {
        // Get purchases for any of the instructor's lessons
        const { data, error } = await supabase
          .from("purchases")
          .select("*, lesson:lesson_id(title)")
          .in("lesson_id", lessonIds);
        
        if (error) {
          console.error("Error fetching purchases:", error.message);
        } else {
          purchases = data || [];
        }
        
        // Check for older purchases that might have video_id instead of lesson_id
        // First check if video_id column exists by making a test query
        try {
          const testVideoColumn = await supabase
            .from("purchases")
            .select("video_id")
            .limit(1);
          
          // If video_id column exists, get purchases by video_id
          if (!testVideoColumn.error) {
            // Get all videos owned by this instructor
            const { data: videoData, error: videoError } = await supabase
              .from("videos")
              .select("id")
              .eq("instructor_id", user.id);
              
            if (!videoError && videoData && videoData.length > 0) {
              const videoIds = videoData.map(video => video.id);
              
              // Get purchases for any of the instructor's videos
              const { data: videoPurchases, error: videoPurchaseError } = await supabase
                .from("purchases")
                .select("*")
                .in("video_id", videoIds);
              
              if (!videoPurchaseError && videoPurchases) {
                purchases = [...purchases, ...videoPurchases];
              }
            }
          }
        } catch (e) {
          // Video purchases query skipped - column may not exist
        }
      }
    }
  } catch (error) {
    console.error("Error fetching purchases:", error instanceof Error ? error.message : String(error));
  }

  // Get the instructor's profile including Stripe Connect status and earnings
  const { data: instructorProfile } = await supabase
    .from("instructor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()
    
  // Calculate earnings from purchases as fallback
  const calculatedEarnings = purchases.reduce((sum, purchase) => sum + (purchase.instructor_payout_amount || 0), 0) || 0
  
  // Use the stored total_earnings if available, otherwise use calculated value
  const totalEarnings = instructorProfile?.total_earnings || calculatedEarnings
  

  // If no profile exists, create one
  if (!instructorProfile) {
    await supabase.from("instructor_profiles").insert({
      user_id: user.id,
      stripe_account_enabled: false,
      stripe_onboarding_complete: false,
    })
  }

  const hasStripeAccount = !!instructorProfile?.stripe_account_id
  const stripeAccountEnabled = !!instructorProfile?.stripe_account_enabled

  return (
    <div className="container py-4 sm:py-8">
      {!hasStripeAccount && (
        <Alert variant="warning" className="mb-4 sm:mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stripe Connect Required</AlertTitle>
          <AlertDescription className="text-sm">
            Set up Stripe Connect to receive payments.{" "}
            <Link href="/dashboard/stripe-connect" className="font-medium underline">
              Set up now
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {hasStripeAccount && !stripeAccountEnabled && (
        <Alert variant="warning" className="mb-4 sm:mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Complete Stripe Setup</AlertTitle>
          <AlertDescription className="text-sm">
            Complete the onboarding process to receive payments.{" "}
            <Link href="/dashboard/stripe-connect" className="font-medium underline">
              Complete setup
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage lessons and track earnings</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {isAdmin && (
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link href="/admin">
                <ExternalLink className="mr-1 h-4 w-4" />
                <span className="sm:inline">Admin</span>
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link href="/dashboard/stripe-connect">
              <ExternalLink className="mr-1 h-4 w-4" />
              <span className="sm:inline">Stripe</span>
            </Link>
          </Button>
          <Button size="sm" className="h-9" asChild>
            <Link href="/dashboard/upload">Create</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 mb-6 sm:mb-8 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Lessons</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{lessons?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Purchases</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{purchases?.length || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              ({purchases.filter(p => p.is_free).length} free)
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{formatPrice(totalEarnings)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {purchases.filter(p => !p.is_free).length} paid
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Stripe Status</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-2">
              {stripeAccountEnabled ? (
                <>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  <span className="text-sm font-medium">Ready</span>
                </>
              ) : hasStripeAccount ? (
                <>
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  <span className="text-sm font-medium">Incomplete</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  <span className="text-sm font-medium">Not Set Up</span>
                </>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full h-7 text-xs" asChild>
              <Link href="/dashboard/stripe-connect">{hasStripeAccount ? "Manage" : "Set Up"}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Lessons</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="order-2 sm:order-1">
            <Button size="sm" className="h-9 w-full" asChild>
              <LessonCreationGuide />
            </Button>
          </div>
          <Button size="sm" className="order-1 sm:order-2 h-9" asChild disabled={!stripeAccountEnabled}>
            <Link href="/dashboard/upload?type=lesson">Create New</Link>
          </Button>
        </div>
      </div>

      {!stripeAccountEnabled && (
        <Alert className="mb-4 sm:mb-6 px-3 py-2 sm:p-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm">Stripe Connect Required</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">
            Complete Stripe setup before creating paid lessons.
          </AlertDescription>
        </Alert>
      )}

      {lessons && lessons.length > 0 ? (
        <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="overflow-hidden shadow-sm">
              <div className="aspect-video relative">
                <Image
                  src={lesson.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader className="p-3 sm:p-4 pb-0">
                <CardTitle className="line-clamp-1 text-base sm:text-lg">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-2 pb-0">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{formatPrice(lesson.price)}</span>
                </div>
              </CardContent>
              <CardFooter className="p-3 sm:p-4 flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 h-8">
                  <Link href={`/lessons/${lesson.id}`}>View</Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1 h-8">
                  <Link href={`/dashboard/lessons/${lesson.id}`}>Manage</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-6 sm:py-8 border rounded-lg bg-muted/20">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No lessons yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first lesson</p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto px-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Learn how it works</h4>
              <LessonCreationGuide variant="card" />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Create your first lesson</h4>
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {!stripeAccountEnabled 
                        ? "Complete Stripe Connect setup for paid lessons"
                        : "Ready to create your first lesson?"
                      }
                    </p>
                    <Button size="sm" className="w-full" asChild disabled={!stripeAccountEnabled}>
                      <Link href="/dashboard/upload?type=lesson">Create Paid Lesson</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/dashboard/upload">Create Free Lesson</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

