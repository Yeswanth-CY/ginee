"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResumeUpload } from "@/components/resume-upload"
import { Loader2, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EducationSection } from "@/components/resume/education-section"
import { ExperienceSection } from "@/components/resume/experience-section"
import { ProjectsSection } from "@/components/resume/projects-section"
import { CertificationsSection } from "@/components/resume/certifications-section"
import { SkillsSection } from "@/components/resume/skills-section"
import { LanguagesSection } from "@/components/resume/languages-section"
import { useToast } from "@/hooks/use-toast"

export default function ResumePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("experience")
  const { user, supabase } = useAuth()
  const { toast } = useToast()

  const fetchUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch education data
      const { data: educationData, error: educationError } = await supabase
        .from("user_education")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })

      if (educationError) throw educationError

      // Fetch experience data
      const { data: experienceData, error: experienceError } = await supabase
        .from("user_experience")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })

      if (experienceError) throw experienceError

      // Fetch certifications
      const { data: certificationsData, error: certificationsError } = await supabase
        .from("user_certifications")
        .select("*")
        .eq("user_id", user.id)
        .order("issue_date", { ascending: false })

      if (certificationsError) throw certificationsError

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })

      if (projectsError) throw projectsError

      // Fetch skills
      const { data: skillsData, error: skillsError } = await supabase
        .from("user_skills")
        .select(`
          id,
          proficiency_level,
          skill_id,
          skills (
            id,
            name,
            category
          )
        `)
        .eq("user_id", user.id)

      if (skillsError) throw skillsError

      // Fetch languages
      const { data: languagesData, error: languagesError } = await supabase
        .from("user_languages")
        .select("*")
        .eq("user_id", user.id)

      if (languagesError) throw languagesError

      // Fetch resume file info
      const { data: resumeData, error: resumeError } = await supabase
        .from("user_resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false })
        .limit(1)

      if (resumeError) throw resumeError

      // Process skills data to include category and name
      const processedSkills = skillsData.map((skill) => ({
        id: skill.id,
        name: skill.skills.name,
        category: skill.skills.category,
        proficiency_level: skill.proficiency_level,
        skill_id: skill.skill_id,
      }))

      setUserData({
        education: educationData || [],
        experience: experienceData || [],
        certifications: certificationsData || [],
        projects: projectsData || [],
        skills: processedSkills || [],
        languages: languagesData || [],
        resume: resumeData && resumeData.length > 0 ? resumeData[0] : null,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "Failed to load resume data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [user, supabase])

  const handleDownloadResume = () => {
    // In a real implementation, this would download the actual resume file
    toast({
      title: "Download not available",
      description: "This feature is not implemented in the demo.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading resume data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Resume</h2>
        <p className="text-muted-foreground">
          Upload your resume to automatically extract your skills, education, experience, and more
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="languages">Languages</TabsTrigger>
            </TabsList>
            <TabsContent value="experience" className="space-y-4">
              <ExperienceSection experience={userData?.experience || []} onUpdate={fetchUserData} />
            </TabsContent>
            <TabsContent value="education" className="space-y-4">
              <EducationSection education={userData?.education || []} onUpdate={fetchUserData} />
            </TabsContent>
            <TabsContent value="skills" className="space-y-4">
              <SkillsSection skills={userData?.skills || []} onUpdate={fetchUserData} />
            </TabsContent>
            <TabsContent value="projects" className="space-y-4">
              <ProjectsSection projects={userData?.projects || []} onUpdate={fetchUserData} />
            </TabsContent>
            <TabsContent value="certifications" className="space-y-4">
              <CertificationsSection certifications={userData?.certifications || []} onUpdate={fetchUserData} />
            </TabsContent>
            <TabsContent value="languages" className="space-y-4">
              <LanguagesSection languages={userData?.languages || []} onUpdate={fetchUserData} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ResumeUpload />

          {userData?.resume && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Current Resume</h3>
                        <p className="text-xs text-muted-foreground">Last uploaded resume</p>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleDownloadResume}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Filename:</span>
                      <span className="font-medium">{userData.resume.file_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span>{new Date(userData.resume.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{userData.resume.status}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
