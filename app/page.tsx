import { createServerClient } from "@/lib/supabase/server"
import { LessonCard } from "@/components/lesson-card"
import { Hero } from "@/components/hero"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createServerClient()


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
      instructorName
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

    </div>
  )
}

