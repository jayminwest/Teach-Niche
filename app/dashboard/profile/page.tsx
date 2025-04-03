"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth/sign-in")
          return
        }
        
        // Check if user is an instructor
        const { data: instructorData, error: instructorError } = await supabase
          .from("instructor_profiles")
          .select("name, bio")
          .eq("user_id", session.user.id)
          .single()
        
        if (instructorData) {
          setIsInstructor(true)
          setName(instructorData.name || "")
          setBio(instructorData.bio || "")
        } else {
          // Get user profile from users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name, bio")
            .eq("id", session.user.id)
            .single()
          
          if (userData) {
            setName(userData.name || "")
            setBio(userData.bio || "")
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [supabase, router, toast])
  
  async function handleSaveProfile() {
    try {
      setSaving(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/sign-in")
        return
      }
      
      if (isInstructor) {
        // Update instructor profile
        const { error } = await supabase
          .from("instructor_profiles")
          .update({ name, bio })
          .eq("user_id", session.user.id)
        
        if (error) throw error
      } else {
        // Check if users table exists and has name/bio columns
        // If not, we'll need to create it or add columns
        const { error } = await supabase
          .from("users")
          .upsert({ 
            id: session.user.id,
            name,
            bio
          })
        
        if (error) throw error
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved",
      })
      
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile information",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information that will be visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell us about yourself"
              rows={5}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
