import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Redirect to the new endpoint
  const { searchParams } = new URL(request.url)
  const url = new URL("/api/verify-lesson-purchase", request.url)
  
  // Forward all search parameters
  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })
  
  return NextResponse.redirect(url.toString())
}
