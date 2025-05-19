"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, LineChart, Target, Trophy, FileText } from "lucide-react"
import { SkillRadarChart } from "@/components/skill-radar-chart"
import { RecommendedCourses } from "@/components/recommended-courses"
import { UpcomingMilestones } from "@/components/upcoming-milestones"
import { RecentActivity } from "@/components/recent-activity"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { user, supabase } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Fetch user metrics - handle case where metrics might not exist yet
        const { data: metricsData, error: metricsError } = await supabase
          .from("user_metrics")
          .select("*")
          .eq("user_id", user.id)

        // Instead of using .single() which throws an error if no rows are found,
        // we'll check if data exists and use the first item if there are multiple
        const metrics = metricsData && metricsData.length > 0 ? metricsData[0] : null

        if (metricsError && metricsError.code !== "PGRST116") {
          console.error("Error fetching metrics:", metricsError)
        }

        // Fetch user skills
        const { data: skillsData, error: skillsError } = await supabase
          .from("user_skills")
          .select(`
            proficiency_level,
            skills (
              name,
              category
            )
          `)
          .eq("user_id", user.id)

        if (skillsError) {
          console.error("Error fetching skills:", skillsError)
        }

        // Fetch completed courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("user_courses")
          .select(`
            score,
            completion_date,
            courses (
              title,
              category,
              difficulty_level
            )
          `)
          .eq("user_id", user.id)

        if (coursesError) {
          console.error("Error fetching courses:", coursesError)
        }

        // Safely fetch education data - handle case where table might not exist
        let educationData = []
        try {
          const { data, error } = await supabase.from("user_education").select("*").eq("user_id", user.id)

          if (error) {
            console.error("Error fetching education:", error)
          } else {
            educationData = data || []
          }
        } catch (err) {
          console.error("Error accessing education table:", err)
        }

        // Safely fetch certifications
        let certificationsData = []
        try {
          const { data, error } = await supabase.from("user_certifications").select("*").eq("user_id", user.id)

          if (error) {
            console.error("Error fetching certifications:", error)
          } else {
            certificationsData = data || []
          }
        } catch (err) {
          console.error("Error accessing certifications table:", err)
        }

        // Safely fetch projects
        let projectsData = []
        try {
          const { data, error } = await supabase.from("user_projects").select("*").eq("user_id", user.id)

          if (error) {
            console.error("Error fetching projects:", error)
          } else {
            projectsData = data || []
          }
        } catch (err) {
          console.error("Error accessing projects table:", err)
        }

        setUserData({
          metrics: metrics,
          skills: skillsData || [],
          courses: coursesData || [],
          education: educationData,
          certifications: certificationsData,
          projects: projectsData,
        })
      } catch (error: any) {
        console.error("Error fetching user data:", error)
        setError("There was an issue loading your dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  // If no user data exists yet, show onboarding screen
  if (!userData || (!userData.metrics && userData.skills.length === 0 && userData.courses.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <h2 className="text-2xl font-bold mb-4">Welcome to Ginee!</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Let's get started by setting up your profile and uploading your resume to provide personalized
          recommendations.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard/resume">
            <Button>Upload Your Resume</Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button variant="outline">Chat with Ginee</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {user?.user_metadata?.name || "User"}! Here's your learning progress.
          </p>
        </div>
        <Link href="/dashboard/chat">
          <Button>Chat with Ginee</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resume Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.metrics?.resume_score || 0}/100</div>
            <Progress value={userData.metrics?.resume_score || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interview Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.metrics?.interview_score || 0}/100</div>
            <Progress value={userData.metrics?.interview_score || 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience Points</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.metrics?.experience_points || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Level {Math.floor((userData.metrics?.experience_points || 0) / 500) + 1}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userData.courses?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {userData.courses?.length
                ? `Last completed ${new Date(userData.courses[0].completion_date).toLocaleDateString()}`
                : "No courses completed yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Skill Breakdown</CardTitle>
                <CardDescription>Your current skill proficiency levels</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SkillRadarChart skills={userData.skills} />
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Recommended Courses</CardTitle>
                <CardDescription>Based on your skills and career goals</CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendedCourses skills={userData.skills} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Milestones</CardTitle>
                <CardDescription>Your next learning goals</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingMilestones metrics={userData.metrics} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your learning journey so far</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity courses={userData.courses} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Track your improvement over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Progress tracking will be available after completing more courses
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
