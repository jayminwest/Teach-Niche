import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the bucket name from the query parameters
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get("bucket")

    if (!bucketName) {
      return NextResponse.json({ success: false, message: "Bucket name is required" }, { status: 400 })
    }

    // Check if the bucket exists
    try {
      const { data: bucketExists, error: bucketError } = await supabase.storage.getBucket(bucketName)

      if (bucketError || !bucketExists) {
        return NextResponse.json(
          { success: false, message: `Bucket ${bucketName} does not exist`, error: bucketError },
          { status: 404 },
        )
      }
    } catch (error) {
      // Continue anyway, as we might get an error if we don't have permission to check buckets
      console.error(`Error checking if bucket ${bucketName} exists:`, error)
    }

    const policies = []

    if (bucketName === "videos") {
      // For videos bucket: only authenticated users can upload, only owners can access
      const insertPolicy = await supabase.storage.from(bucketName).createPolicy("authenticated_uploads", {
        name: "authenticated_uploads",
        definition: `(auth.role() = 'authenticated')`,
        action: "INSERT",
      })

      const selectPolicy = await supabase.storage.from(bucketName).createPolicy("owner_access", {
        name: "owner_access",
        definition: `(auth.uid() = owner)`,
        action: "SELECT",
      })

      policies.push({ name: "authenticated_uploads", result: insertPolicy })
      policies.push({ name: "owner_access", result: selectPolicy })
    } else if (bucketName === "thumbnails") {
      // For thumbnails bucket: public access for reading, only authenticated for uploading
      const selectPolicy = await supabase.storage.from(bucketName).createPolicy("public_access", {
        name: "public_access",
        definition: `(true)`,
        action: "SELECT",
      })

      const insertPolicy = await supabase.storage.from(bucketName).createPolicy("authenticated_uploads", {
        name: "authenticated_uploads",
        definition: `(auth.role() = 'authenticated')`,
        action: "INSERT",
      })

      policies.push({ name: "public_access", result: selectPolicy })
      policies.push({ name: "authenticated_uploads", result: insertPolicy })
    } else {
      return NextResponse.json({ success: false, message: `Unsupported bucket: ${bucketName}` }, { status: 400 })
    }

    // Check if any policy creation failed
    const hasErrors = policies.some((policy) => policy.result.error)

    return NextResponse.json({
      success: !hasErrors,
      bucket: bucketName,
      policies,
    })
  } catch (error: any) {
    console.error("Error setting up RLS policies:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
        error,
      },
      { status: 500 },
    )
  }
}

