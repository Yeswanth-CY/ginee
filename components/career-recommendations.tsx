"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, ArrowRight, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveJobPreference, generateStudyPlan } from "@/app/actions/career-actions"
import type { JobRecommendation, CourseRecommendation, SkillGap } from "@/lib/data-analysis"

interface CareerRecommendationsProps {
  userId: string
  jobRecommendations: JobRecommendation[]
  courseRecommendations: CourseRecommendation[]
  skillGaps: SkillGap[]
}

export function CareerRecommendations({
  userId,
  jobRecommendations,
  courseRecommendations,
  skillGaps,
}: CareerRecommendationsProps) {
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [studyPlan, setStudyPlan] = useState<any | null>(null)
  const { toast } = useToast()

  const handleSelectJob = async (jobTitle: string) => {
    try {
      setSelectedJob(jobTitle)

      const result = await saveJobPreference(userId, jobTitle)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Job preference saved",
        description: `You've selected ${jobTitle} as your target role.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save job preference",
        variant: "destructive",
      })
    }
  }

  const handleGenerateStudyPlan = async () => {
    if (!selectedJob) return

    setIsGeneratingPlan(true)

    try {
      const result = await generateStudyPlan(userId, selectedJob)

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to generate study plan")
      }

      setStudyPlan(result.data)

      toast({
        title: "Study plan generated",
        description: "Your personalized study plan is ready!",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate study plan",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  if (jobRecommendations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No job recommendations available</p>
            <p className="text-sm text-muted-foreground mt-2 mb-4">
              Add more skills to your profile to get personalized job recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {!studyPlan ? (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recommended Job Roles</h3>
            <p className="text-sm text-muted-foreground">
              Based on your skills and experience, here are some job roles that might be a good fit for you.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {jobRecommendations.map((job) => (
                <Card key={job.title} className={selectedJob === job.title ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </div>
                      <Badge variant={job.matchScore > 70 ? "default" : "secondary"}>{job.matchScore}% Match</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Match Score</span>
                          <span>{job.matchScore}%</span>
                        </div>
                        <Progress value={job.matchScore} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill) => {
                            const isMissing = job.missingSkills.some(
                              (s) => s.skillName.toLowerCase() === skill.toLowerCase(),
                            )
                            return (
                              <Badge key={skill} variant={isMissing ? "outline" : "secondary"}>
                                {isMissing ? (
                                  <XCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                {skill}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      {job.averageSalary && (
                        <div className="text-sm">
                          <span className="font-medium">Average Salary:</span> {job.averageSalary}
                        </div>
                      )}

                      {job.growthOutlook && (
                        <div className="text-sm">
                          <span className="font-medium">Growth Outlook:</span> {job.growthOutlook}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={selectedJob === job.title ? "default" : "outline"}
                      className="w-full"
                      onClick={() => handleSelectJob(job.title)}
                    >
                      {selectedJob === job.title ? "Selected" : "Select as Target Role"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {selectedJob && (
            <div className="flex justify-center">
              <Button onClick={handleGenerateStudyPlan} disabled={isGeneratingPlan}>
                {isGeneratingPlan ? (
                  <>Generating Study Plan...</>
                ) : (
                  <>
                    Generate Study Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recommended Courses</h3>
            <p className="text-sm text-muted-foreground">
              These courses can help you develop the skills needed for your target roles.
            </p>

            <div className="space-y-4">
              {courseRecommendations.map((course) => (
                <Card key={course.title}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.provider}</CardDescription>
                      </div>
                      <div className="bg-primary/10 p-2 rounded">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {course.skillsCovered.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Difficulty: {course.difficulty}</span>
                        <span>Duration: {course.duration}</span>
                      </div>
                    </div>
                  </CardContent>
                  {course.url && (
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                          View Course
                        </a>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skill Gaps to Address</h3>
            <p className="text-sm text-muted-foreground">
              Based on job market demand, here are skills you should focus on developing.
            </p>

            <div className="space-y-4">
              {skillGaps.map((skill) => (
                <div key={skill.skillName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{skill.skillName}</span>
                      <span className="text-sm text-muted-foreground ml-2">({skill.category})</span>
                    </div>
                    <Badge variant="outline">Importance: {skill.importance}/5</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-20">
                      {skill.currentLevel ? `Level ${skill.currentLevel}` : "Not Started"}
                    </span>
                    <Progress
                      value={skill.currentLevel ? (skill.currentLevel / skill.recommendedLevel) * 100 : 0}
                      className="h-2 flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      Target: Level {skill.recommendedLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Your Study Plan for {studyPlan.jobTitle}</h3>
            <Button variant="outline" onClick={() => setStudyPlan(null)}>
              Back to Recommendations
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>{studyPlan.overview}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Estimated Timeframe: {studyPlan.timeframe}</p>
                  <p className="text-sm text-muted-foreground">
                    This plan is designed to help you reach a {studyPlan.matchScore}% match for the {studyPlan.jobTitle}{" "}
                    role.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Skills to Focus On:</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {studyPlan.skillsToFocus.map((skill: any) => (
                      <Card key={skill.name} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{skill.name}</span>
                          <Badge variant="outline">Priority: {skill.priority}/5</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Current: Level {skill.currentLevel}</span>
                            <span>Target: Level {skill.targetLevel}</span>
                          </div>
                          <Progress value={(skill.currentLevel / skill.targetLevel) * 100} className="h-1.5" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Milestones</h3>
            <div className="space-y-4">
              {studyPlan.milestones.map((milestone: any, index: number) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {index + 1}. {milestone.title} ({milestone.duration})
                    </CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 list-disc pl-5">
                      {milestone.tasks.map((task: string, taskIndex: number) => (
                        <li key={taskIndex} className="text-sm">
                          {task}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recommended Courses</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {studyPlan.recommendedCourses.map((course: CourseRecommendation) => (
                <Card key={course.title}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{course.title}</CardTitle>
                        <CardDescription>{course.provider}</CardDescription>
                      </div>
                      <div className="bg-primary/10 p-2 rounded">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {course.skillsCovered.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Difficulty: {course.difficulty}</span>
                      <span>Duration: {course.duration}</span>
                    </div>
                  </CardContent>
                  {course.url && (
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={course.url} target="_blank" rel="noopener noreferrer">
                          View Course
                        </a>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
