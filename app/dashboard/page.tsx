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

  // Determine which environment we're in based on Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isDevelopment = supabaseUrl.includes('nqmtr');
  const environmentName = isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION';
  
  console.log(`Dashboard: Running in ${environmentName} environment`);
  console.log(`Dashboard: Supabase URL: ${supabaseUrl}`);

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

  
  // Get instructor profile and purchases directly
  let purchases: PurchaseWithLesson[] = [];
  let totalEarnings = 0;
  let freeCount = 0;
  let paidCount = 0;
  
  try {
    // Get all lessons by this instructor
    const { data: instructorLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("instructor_id", user.id);
    
    if (lessonsError) {
      console.error("Dashboard: Error fetching instructor lessons:", lessonsError.message);
    }
    
    const lessonIds = instructorLessons?.map(lesson => lesson.id) || [];
    console.log(`Dashboard: Found ${lessonIds.length} lessons for instructor ${user.id}`);
    
    if (lessonIds.length === 0) {
      console.log("Dashboard: No lessons found for instructor");
    } else {
      // Get all purchases in the system
      const { data: allPurchases, error: purchasesError } = await supabase
        .from("purchases")
        .select("*");
      
      if (purchasesError) {
        console.error("Dashboard: Error fetching purchases:", purchasesError.message);
      } else {
        console.log(`Dashboard: Total purchases in system: ${allPurchases?.length || 0}`);
        
        // Manually filter purchases related to this instructor's lessons
        if (allPurchases && allPurchases.length > 0) {
          purchases = allPurchases.filter(purchase => 
            lessonIds.includes(purchase.lesson_id)
          );
          
          // Calculate stats
          freeCount = purchases.filter(p => p.is_free === true).length;
          paidCount = purchases.length - freeCount;
          
          // Calculate earnings
          totalEarnings = purchases.reduce((sum, purchase) => {
            // Skip free purchases
            if (purchase.is_free === true) return sum;
            
            // Convert string to number if needed (Supabase returns decimal as string)
            const amount = typeof purchase.instructor_payout_amount === 'string' 
              ? parseFloat(purchase.instructor_payout_amount) 
              : (purchase.instructor_payout_amount || 0);
            
            return sum + amount;
          }, 0);
          
          console.log(`Dashboard: Found ${purchases.length} purchases (${freeCount} free, ${paidCount} paid) with $${totalEarnings} earnings`);
        }
      }
    }
  } catch (error) {
    console.error("Dashboard: Error processing purchases:", error instanceof Error ? error.message : String(error));
  }

  // Get the instructor's profile including Stripe Connect status
  const { data: instructorProfile } = await supabase
    .from("instructor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()
    
  // If the instructor profile has stored earnings, use that as the source of truth
  if (instructorProfile?.total_earnings) {
    try {
      const profileEarnings = parseFloat(instructorProfile.total_earnings);
      if (!isNaN(profileEarnings)) {
        totalEarnings = profileEarnings;
        console.log(`Dashboard: Using profile stored earnings: $${totalEarnings}`);
      }
    } catch (e) {
      console.error("Dashboard: Error parsing profile earnings:", e);
    }
  }
  

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
      {/* Development Environment Banner */}
      {isDevelopment && (
        <Alert className="mb-4 sm:mb-6 bg-green-100 dark:bg-green-900 border-green-500 text-green-900 dark:text-green-100">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Development Environment</AlertTitle>
          <AlertDescription className="text-sm">
            Using Supabase project: <strong>{supabaseUrl.replace('https://', '')}</strong>
          </AlertDescription>
        </Alert>
      )}
      
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
              ({freeCount} free)
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
              {paidCount} paid
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

