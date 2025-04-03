import Link from "next/link"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import Image from "next/image"
import { AlertTriangle, CheckCircle, ExternalLink, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

  // Fetch lessons created by this instructor
  let lessons = [];
  try {
    // Check if parent_lesson_id column exists
    const { error: columnCheckError } = await supabase.rpc('column_exists', { 
      table_name: 'lessons', 
      column_name: 'parent_lesson_id' 
    });
    
    let query = supabase
      .from("lessons")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });
    
    // Only filter by parent_lesson_id if the column exists
    if (!columnCheckError) {
      query = query.is("parent_lesson_id", null);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching lessons:", error.message);
    } else {
      lessons = data || [];
    }
  } catch (error) {
    console.error("Error fetching lessons:", error instanceof Error ? error.message : String(error));
  }

  // Fetch child lessons (videos) for counting
  let childLessons = [];
  try {
    // First check if parent_lesson_id column exists
    const { error: columnCheckError } = await supabase.rpc('column_exists', { 
      table_name: 'lessons', 
      column_name: 'parent_lesson_id' 
    });
    
    // If the RPC doesn't exist or fails, we'll try the query anyway
    if (!columnCheckError) {
      const { data, error } = await supabase
        .from("lessons")
        .select("parent_lesson_id")
        .not("parent_lesson_id", "is", null)
        .eq("instructor_id", user.id);
      
      if (error) {
        console.error("Error fetching child lessons:", error.message);
      } else {
        childLessons = data || [];
      }
    }
  } catch (error) {
    console.error("Error fetching child lessons:", error instanceof Error ? error.message : String(error));
  }

  // Count videos per lesson
  const lessonVideoCounts = childLessons.reduce((counts: Record<string, number>, child) => {
    const parentId = child.parent_lesson_id as string
    counts[parentId] = (counts[parentId] || 0) + 1
    return counts
  }, {}) || {}

  // Fetch standalone lessons (those with video_url but no parent)
  let standaloneVideos = [];
  try {
    // Check if parent_lesson_id column exists
    const { error: columnCheckError } = await supabase.rpc('column_exists', { 
      table_name: 'lessons', 
      column_name: 'parent_lesson_id' 
    });
    
    let query = supabase
      .from("lessons")
      .select("*")
      .eq("instructor_id", user.id)
      .not("video_url", "is", null)
      .order("created_at", { ascending: false });
    
    // Only filter by parent_lesson_id if the column exists
    if (!columnCheckError) {
      query = query.is("parent_lesson_id", null);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching standalone videos:", error.message);
    } else {
      standaloneVideos = data || [];
    }
  } catch (error) {
    console.error("Error fetching standalone videos:", error instanceof Error ? error.message : String(error));
  }
  
  console.log("Standalone videos found:", standaloneVideos?.length || 0);

  console.log("Lessons found:", lessons?.length || 0);
  
  // Calculate total earnings
  let purchases = [];
  try {
    const lessonIds = [
      ...lessons.map(lesson => lesson.id),
      ...standaloneVideos.map(video => video.id)
    ].filter(Boolean);
    
    if (lessonIds.length > 0) {
      const { data, error } = await supabase
        .from("purchases")
        .select("amount, instructor_payout_amount")
        .in("lesson_id", lessonIds);
      
      if (error) {
        console.error("Error fetching purchases:", error.message);
      } else {
        purchases = data || [];
      }
    }
  } catch (error) {
    console.error("Error fetching purchases:", error instanceof Error ? error.message : String(error));
  }

  const totalEarnings = purchases.reduce((sum, purchase) => sum + (purchase.instructor_payout_amount || 0), 0) || 0

  // Get the instructor's Stripe Connect status
  const { data: instructorProfile } = await supabase
    .from("instructor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

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
  const stripeOnboardingComplete = !!instructorProfile?.stripe_onboarding_complete

  return (
    <div className="container py-8">
      {!hasStripeAccount && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stripe Connect Setup Required</AlertTitle>
          <AlertDescription>
            Before creating paid lessons, you need to set up your Stripe Connect account to receive payments.{" "}
            <Link href="/dashboard/stripe-connect" className="font-medium underline">
              Set up Stripe Connect
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      {standaloneVideos && standaloneVideos.length > 0 && (
        <>
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">Your Standalone Videos</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {standaloneVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={video.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">{formatPrice(video.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>Standalone Video</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/lessons/${video.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/dashboard/lessons/${video.id}`}>Manage</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {hasStripeAccount && !stripeAccountEnabled && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stripe Connect Setup Incomplete</AlertTitle>
          <AlertDescription>
            Your Stripe Connect account setup is incomplete. You need to complete the onboarding process to receive
            payments.{" "}
            <Link href="/dashboard/stripe-connect" className="font-medium underline">
              Complete Stripe Setup
            </Link>
          </AlertDescription>
        </Alert>
      )}


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your tutorial lessons and track earnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/stripe-connect">
              <ExternalLink className="mr-2 h-4 w-4" />
              Stripe Connect
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/upload">Upload Content</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(lessons?.length || 0) + (standaloneVideos?.length || 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(totalEarnings)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stripe Connect Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {stripeAccountEnabled ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Ready</span>
                  </>
                ) : hasStripeAccount ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">Incomplete</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Not Set Up</span>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard/stripe-connect">{hasStripeAccount ? "Manage Stripe" : "Set Up Stripe"}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>


      <h2 className="text-2xl font-bold tracking-tight mb-6">Your Lessons</h2>

      <div className="flex justify-end mb-4">
        <Button asChild disabled={!stripeAccountEnabled}>
          <Link href="/dashboard/upload?type=lesson">Create New Lesson</Link>
        </Button>
      </div>

      {!stripeAccountEnabled && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Stripe Connect Required</AlertTitle>
          <AlertDescription>
            You need to complete your Stripe Connect setup before creating paid lessons.
          </AlertDescription>
        </Alert>
      )}

      {lessons && lessons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <Image
                  src={lesson.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                  alt={lesson.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <CardHeader>
                <CardTitle className="line-clamp-1">{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{formatPrice(lesson.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Videos:</span>
                  <span>{lessonVideoCounts[lesson.id] || 0}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/lessons/${lesson.id}`}>View</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/dashboard/lessons/${lesson.id}`}>Manage</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-xl font-semibold mb-2">No lessons yet</h3>
          <p className="text-muted-foreground mb-6">Create your first lesson with video content</p>
          <Button asChild disabled={!stripeAccountEnabled}>
            <Link href="/dashboard/upload?type=lesson">Create Lesson</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

