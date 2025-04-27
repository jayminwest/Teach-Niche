"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export default function DebugHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          setError(sessionError.message)
        }
        
        setUser(session?.user || null)
        setLoading(false)
      } catch (err) {
        console.error("Auth error:", err)
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <div className="fixed top-0 right-0 z-50 p-4 bg-black/80 text-white text-xs rounded-bl-lg max-w-xs overflow-auto max-h-80">
      <h2 className="font-bold text-sm mb-2">Auth Debug:</h2>
      <p><strong>Loading:</strong> {loading ? "true" : "false"}</p>
      <p><strong>User:</strong> {user ? "Logged in" : "Not logged in"}</p>
      {user && (
        <div className="mt-1">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id.slice(0, 8)}...</p>
        </div>
      )}
      {error && (
        <p className="text-red-400 mt-1"><strong>Error:</strong> {error}</p>
      )}
    </div>
  )
}