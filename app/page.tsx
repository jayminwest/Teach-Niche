import { createServerClient } from "@/lib/supabase/server"
import { LessonCard } from "@/components/lesson-card"
import { Hero } from "@/components/hero"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default async function Home() {
  const supabase = await createServerClient()
  
  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user's purchased lessons if logged in
  let purchasedLessonIds: string[] = []
  if (user) {
    const { data: purchasedLessons } = await supabase
      .from("purchases")
      .select("lesson_id")
      .eq("user_id", user.id)
      .not("lesson_id", "is", null)

    purchasedLessonIds = purchasedLessons?.map((p) => p.lesson_id) || []
  }

  // Fetch a few recent lessons for the homepage
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)
    
  // Get video counts and instructor info for each lesson
  const lessonsWithCounts = await Promise.all((lessons || []).map(async (lesson) => {
    // Get video count
    const { count } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("lesson_id", lesson.id)
    
    // Get instructor name
    let instructorName = "Instructor";
    if (lesson?.instructor_id) {
      // Try to get instructor profile first
      const { data: instructorProfile } = await supabase
        .from("instructor_profiles")
        .select("name")
        .eq("user_id", lesson.instructor_id)
        .single();
      
      if (instructorProfile?.name) {
        instructorName = instructorProfile.name;
      } else {
        // Then try to get user data
        const { data: userData } = await supabase
          .from("users")
          .select("name")
          .eq("id", lesson.instructor_id)
          .single();
          
        if (userData?.name) {
          instructorName = userData.name;
        }
      }
    }
    
    return {
      ...lesson,
      videoCount: count || 0,
      instructorName,
      isPurchased: purchasedLessonIds.includes(lesson.id)
    }
  }))

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Hero />

      {lessonsWithCounts && lessonsWithCounts.length > 0 && (
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Featured Lessons</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Complete kendama lesson packages from our expert instructors
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {lessonsWithCounts.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  id={lesson.id}
                  title={lesson.title}
                  thumbnailUrl={lesson.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                  price={lesson.price}
                  isPurchased={lesson.isPurchased}
                  videoCount={lesson.videoCount}
                  instructorName={lesson.instructorName}
                />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild>
                <Link href="/lessons">View All Lessons</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Everything you need to know about Teach Niche
              </p>
            </div>
          </div>
          
          <div className="mx-auto max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Teach Niche?</AccordionTrigger>
                <AccordionContent>
                  Teach Niche is a platform dedicated to kendama instruction. We connect skilled kendama players with students looking to improve their skills through high-quality video lessons.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How do I become an instructor?</AccordionTrigger>
                <AccordionContent>
                  Sign up for an account, then visit your dashboard to set up your instructor profile. You'll need to connect a Stripe account to receive payments, then you can start creating lessons and uploading videos.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How much does it cost to use Teach Niche?</AccordionTrigger>
                <AccordionContent>
                  Browsing the platform is free. Individual videos and lesson packages are priced by their instructors. As an instructor, you keep 85% of your earnings, with a 15% platform fee for each sale.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>How long do I have access to purchased content?</AccordionTrigger>
                <AccordionContent>
                  Once you purchase a video or lesson package, you have permanent access to that content through your library.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit and debit cards through our secure payment processor, Stripe.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>Can I download the videos?</AccordionTrigger>
                <AccordionContent>
                  Videos are available for streaming through our platform but cannot be downloaded. This helps protect our instructors' intellectual property.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

    </div>
  )
}

