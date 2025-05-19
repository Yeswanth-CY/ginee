"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Briefcase } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getCareerRecommendations } from "@/app/actions/career-actions"
import { CareerRecommendations } from "@/components/career-recommendations"
import type { CareerAnalysis } from "@/lib/data-analysis"

export default function CareerPage() {
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("recommendations")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchCareerData = async () => {
      if (!user) return

      setLoading(true)
      try {
        const result = await getCareerRecommendations(user.id)

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to get career recommendations")
        }

        setAnalysis(result.data)
      } catch (error: any) {
        console.error("Error fetching career data:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load career recommendations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCareerData()
  }, [user, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your profile and generating recommendations...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Career Recommendations</h2>
          <p className="text-muted-foreground">
            Get personalized job recommendations and career guidance based on your skills and experience
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Not enough data to provide career recommendations</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please add more skills, education, and experience to your profile to get personalized recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Career Recommendations</h2>
        <p className="text-muted-foreground">
          Get personalized job recommendations and career guidance based on your skills and experience
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <CareerRecommendations
            userId={user?.id || ""}
            jobRecommendations={analysis.jobRecommendations}
            courseRecommendations={analysis.courseRecommendations}
            skillGaps={analysis.skillGaps}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Skill Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Here's an analysis of your current skills and areas for improvement
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Skill Categories</h4>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(analysis.currentSkillLevel).map(([category, level]) => (
                          <Card key={category} className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{category}</span>
                              <span className="text-sm">{level.toFixed(1)}/5</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(level / 5) * 100}%` }}
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Your Top Skills</h4>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {analysis.topSkills.map((skill) => (
                          <div key={skill.name} className="flex justify-between items-center p-2 border rounded-md">
                            <span>{skill.name}</span>
                            <span className="text-sm font-medium">{skill.level}/5</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Readiness Metrics</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Resume Score</span>
                            <span className="text-sm font-medium">{analysis.resumeScore}/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${analysis.resumeScore}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Interview Readiness</span>
                            <span className="text-sm font-medium">{analysis.interviewReadiness}/100</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${analysis.interviewReadiness}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
