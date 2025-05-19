"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { user, supabase } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get user data from auth metadata
        setName(user.user_metadata?.name || "")
        setEmail(user.email || "")

        // Get additional profile data from users table
        const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setBio(data.bio || "")
        }

        // Get user skills
        const { data: skillsData, error: skillsError } = await supabase
          .from("user_skills")
          .select(`
            proficiency_level,
            skills (
              id,
              name,
              category
            )
          `)
          .eq("user_id", user.id)

        if (skillsError) throw skillsError

        setSkills(skillsData || [])
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [user, supabase, toast])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { name },
      })

      if (authError) throw authError

      // Update or insert user record
      const { error: dbError } = await supabase.from("users").upsert({
        id: user.id,
        name,
        email,
        bio,
      })

      if (dbError) throw dbError

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and skills</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and bio</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell us a bit about yourself, your career goals, and learning interests"
                  />
                </div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Your current skills and proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              {skills && skills.length > 0 ? (
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{skill.skills.name}</span>
                        <span className="text-muted-foreground">{skill.proficiency_level}/5</span>
                      </div>
                      <Progress value={skill.proficiency_level * 20} />
                      <p className="text-xs text-muted-foreground">Category: {skill.skills.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No skills added yet</p>
                  <p className="text-sm text-muted-foreground">
                    Upload your resume to automatically extract your skills
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/dashboard/resume")}>
                Manage Resume
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>How others see you on Ginee</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl">{name ? getInitials(name) : "U"}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{name || "User"}</h3>
              <p className="text-sm text-muted-foreground mt-1">{email}</p>
              <div className="mt-4 text-sm">
                {bio ? <p>{bio}</p> : <p className="text-muted-foreground italic">No bio provided</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "/dashboard/resume")}
              >
                Manage Resume
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => (window.location.href = "/reset-password")}
              >
                Change Password
              </Button>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Account created on {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
