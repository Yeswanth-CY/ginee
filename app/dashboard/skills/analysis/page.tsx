"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BarChart, Target, TrendingUp, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SkillAnalysisResults } from "@/components/skills/skill-analysis-results"
import { analyzeSkills } from "@/app/actions/skill-actions"

export default function SkillAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [userSkills, setUserSkills] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const { user, supabase } = useAuth()
  const { toast } = useToast()

  // Fetch user skills
  useEffect(() => {
    const fetchUserSkills = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
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

        if (error) throw error

        // Process skills data to include category and name
        const processedSkills = data.map((skill) => ({
          id: skill.id,
          name: skill.skills.name,
          category: skill.skills.category,
          proficiency_level: skill.proficiency_level,
          skill_id: skill.skill_id,
        }))

        setUserSkills(processedSkills)
      } catch (error) {
        console.error("Error fetching user skills:", error)
        toast({
          title: "Error",
          description: "Failed to load skills data",
          variant: "destructive",
        })
      }
    }

    fetchUserSkills()
  }, [user, supabase, toast])

  const handleAnalyzeSkills = async () => {
    if (!user || userSkills.length === 0) return

    setIsAnalyzing(true)

    try {
      const result = await analyzeSkills(user.id)

      if (!result.success) {
        throw new Error(result.error)
      }

      setAnalysisResults(result.data)
      toast({
        title: "Analysis Complete",
        description: "Your skills have been analyzed successfully",
      })
    } catch (error: any) {
      console.error("Error analyzing skills:", error)
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze skills",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Skill Analysis</h2>
        <p className="text-muted-foreground">
          Get a detailed analysis of your skills and personalized recommendations for improvement
        </p>
      </div>

      {userSkills.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No skills found</p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Add skills to your profile to get a personalized analysis
              </p>
              <Button onClick={() => (window.location.href = "/dashboard/resume")}>Manage Skills</Button>
            </div>
          </CardContent>
        </Card>
      ) : analysisResults ? (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <SkillAnalysisResults results={analysisResults} section="overview" userSkills={userSkills} />
            </TabsContent>
            <TabsContent value="strengths" className="space-y-4">
              <SkillAnalysisResults results={analysisResults} section="strengths" userSkills={userSkills} />
            </TabsContent>
            <TabsContent value="gaps" className="space-y-4">
              <SkillAnalysisResults results={analysisResults} section="gaps" userSkills={userSkills} />
            </TabsContent>
            <TabsContent value="recommendations" className="space-y-4">
              <SkillAnalysisResults results={analysisResults} section="recommendations" userSkills={userSkills} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button onClick={handleAnalyzeSkills} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing Analysis...
                </>
              ) : (
                <>
                  <BarChart className="mr-2 h-4 w-4" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Skill Analysis</CardTitle>
            <CardDescription>
              Get a detailed analysis of your skills and personalized recommendations for improvement
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <BarChart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Skill Assessment</h3>
                      <p className="text-sm text-muted-foreground">Evaluate your current skill levels</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Gap Analysis</h3>
                      <p className="text-sm text-muted-foreground">Identify areas for improvement</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Growth Plan</h3>
                      <p className="text-sm text-muted-foreground">Get personalized recommendations</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-6">
                  Click the button below to analyze your skills using AI and get personalized recommendations
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleAnalyzeSkills} disabled={isAnalyzing} size="lg">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Skills...
                </>
              ) : (
                <>
                  <BarChart className="mr-2 h-4 w-4" />
                  Analyze My Skills
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
