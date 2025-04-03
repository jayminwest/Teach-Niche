import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function VideoDetailRedirect({ params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const id = params.id
  
  // First, check if this ID exists as a lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id")
    .eq("id", id)
    .maybeSingle()
  
  if (lesson) {
    // ID exists as a lesson, redirect to the lesson page
    redirect(`/lessons/${id}`)
    return;
  }
  
  // If not found in lessons, try to check in the legacy videos table
  try {
    const { data: video } = await supabase
      .from("videos")
      .select("parent_lesson_id, lesson_id")
      .eq("id", id)
      .maybeSingle()
    
    if (video) {
      // Found as a legacy video, check for an associated lesson
      const lessonId = video.lesson_id || video.parent_lesson_id
      
      if (lessonId) {
        // Redirect to the associated lesson
        redirect(`/lessons/${lessonId}`)
        return;
      }
    }
  } catch (error) {
    // If the videos table no longer exists or any other error,
    // continue to the fallback
  }
  
  // If no mapping found, redirect to the lessons index
  redirect('/lessons')
}
