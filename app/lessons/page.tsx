import { createServerClient } from "@/lib/supabase/server"
import { LessonCard } from "@/components/lesson-card"

export default async function LessonsPage() {
  const supabase = createServerClient()

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user || null

  // Fetch all lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*, videos(count)")
    .order("created_at", { ascending: false })

  // If user is logged in, fetch their purchased lessons
  let purchasedLessonIds: string[] = []
  if (user) {
    const { data: purchasedLessons } = await supabase
      .from("purchases")
      .select("lesson_id")
      .eq("user_id", user.id)
      .not("lesson_id", "is", null)

    purchasedLessonIds = purchasedLessons?.map((p) => p.lesson_id) || []
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">All Lessons</h1>
      <p className="text-muted-foreground mb-8">Browse our collection of kendama lessons</p>

      {lessons && lessons.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              id={lesson.id}
              title={lesson.title}
              thumbnailUrl={lesson.thumbnail_url || "/placeholder.svg?height=200&width=300"}
              price={lesson.price}
              isPurchased={purchasedLessonIds.includes(lesson.id)}
              videoCount={(lesson.videos as any)?.count || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No lessons available yet</h3>
          <p className="text-muted-foreground">Check back soon for new lessons!</p>
        </div>
      )}
    </div>
  )
}

