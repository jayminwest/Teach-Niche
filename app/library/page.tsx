import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { format } from "date-fns"

export default async function Library() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/sign-in?redirectedFrom=/library")
  }

  const user = session.user

  // Fetch the user's purchased lessons
  const { data: purchasedLessons } = await supabase.from("user_purchased_lessons").select("*").eq("user_id", user.id)

  const hasContent = purchasedLessons && purchasedLessons.length > 0

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <p className="text-muted-foreground mb-8">Access your purchased kendama content</p>

      {hasContent ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">My Lessons</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchasedLessons.map((lesson) => (
              <Card key={lesson.lesson_id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={lesson.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                    alt={lesson.title || "Lesson"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{lesson.title || "Untitled Lesson"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchased:</span>
                    <span>{format(new Date(lesson.purchase_date || new Date()), "MMM d, yyyy")}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/lessons/${lesson.lesson_id}`}>View Lesson</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">You haven't purchased any lessons yet</h3>
          <p className="text-muted-foreground mb-6">Browse our collection of kendama tutorials to start learning</p>
          <Link
            href="/lessons"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Lessons
          </Link>
        </div>
      )}
    </div>
  )
}
