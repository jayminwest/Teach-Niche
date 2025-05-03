import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this API" },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // Get the lesson ID from query string if provided
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")
    
    // Get environment info
    const env = process.env.NODE_ENV || 'unknown'
    const vercelEnv = process.env.VERCEL_ENV || 'not-vercel'
    
    // Initialize results object
    const results: any = {
      environment: {
        node_env: env,
        vercel_env: vercelEnv,
      },
      user: {
        id: userId,
      },
    }
    
    // Test all different methods of verification
    
    // 1. Direct purchase check
    if (lessonId) {
      const { data: directPurchase, error: directError } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("lesson_id", lessonId)
        .maybeSingle()
      
      results.directPurchase = { data: directPurchase, error: directError }
    }
    
    // 2. All purchases
    const { data: allPurchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", userId)
    
    results.allPurchases = { 
      count: allPurchases?.length || 0,
      error: purchasesError 
    }
    
    // 3. View check
    const { data: viewResult, error: viewError } = await supabase
      .from("user_purchased_lessons")
      .select("*")
      .eq("user_id", userId)
    
    results.purchasedLessonsView = { 
      count: viewResult?.length || 0,
      error: viewError 
    }
    
    // 4. Function check (if lesson ID provided)
    if (lessonId) {
      try {
        const { data: functionResult, error: functionError } = await supabase.rpc(
          'user_has_purchased_lesson',
          { 
            user_id: userId,
            lesson_id: lessonId
          }
        )
        
        results.functionCheck = { 
          result: functionResult,
          error: functionError 
        }
      } catch (e) {
        results.functionCheck = { 
          error: "Function not available or error calling it",
          details: e
        }
      }
    }
    
    // 5. Check if user is instructor for any lessons
    const { data: instructorLessons, error: instructorError } = await supabase
      .from("lessons")
      .select("id, title")
      .eq("instructor_id", userId)
    
    results.instructorLessons = { 
      count: instructorLessons?.length || 0,
      data: instructorLessons,
      error: instructorError 
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}