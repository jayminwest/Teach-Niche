import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"
import { VideoCard } from "@/components/video-card"
import { LessonCard } from "@/components/lesson-card"
import { formatPrice } from "@/lib/utils"

export default async function Home() {
  const supabase = await createServerClient()

  // Fetch a few recent videos for the homepage
  const { data: videos } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(3)

  // Fetch a few recent lessons for the homepage
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3)
    
  // Get video counts for each lesson
  const lessonsWithCounts = await Promise.all((lessons || []).map(async (lesson) => {
    const { count } = await supabase
      .from("videos")
      .select("*", { count: "exact", head: true })
      .eq("lesson_id", lesson.id)
    
    return {
      ...lesson,
      videoCount: count || 0
    }
  }))

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Learn Kendama from Expert Instructors
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover high-quality tutorial videos from kendama professionals. Master new tricks and techniques at
                  your own pace.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/lessons">Browse Lessons</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/sign-up">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:mx-0 relative h-[350px] w-full max-w-[500px] rounded-lg bg-muted/30 p-2 shadow-lg">
              <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70 border">
                <div className="text-center p-6">
                  <h3 className="text-xl font-bold">Kendama Instruction</h3>
                  <p className="text-muted-foreground">Tutorial video preview thumbnail</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Recent Tutorials</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Check out the latest kendama tutorial videos from our instructors
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {videos && videos.length > 0 ? (
              videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                  price={formatPrice(video.price)}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No videos available yet. Check back soon!
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/videos">View All Videos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

