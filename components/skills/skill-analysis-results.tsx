"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, TrendingUp, BookOpen, Target } from "lucide-react"

interface SkillAnalysisResultsProps {
  results: any
  section: "overview" | "strengths" | "gaps" | "recommendations"
  userSkills: any[]
}

export function SkillAnalysisResults({ results, section, userSkills }: SkillAnalysisResultsProps) {
  if (!results) return null

  // Render different sections based on the selected tab
  switch (section) {
    case "overview":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Analysis Overview</CardTitle>
              <CardDescription>Summary of your skill profile and key insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: results.overview.summary }} />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Skill Distribution</h3>
                  <div className="space-y-4">
                    {Object.entries(results.overview.categoryBreakdown).map(([category, percentage]: [string, any]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{category}</span>
                          <span>{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Key Insights</h3>
                  <ul className="space-y-2">
                    {results.overview.keyInsights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case "strengths":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Strengths</CardTitle>
              <CardDescription>Areas where you excel and have strong proficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: results.strengths.summary }} />
                </div>

                <div className="space-y-4">
                  {results.strengths.topSkills.map((skill: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            <Badge variant="outline">{skill.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.analysis}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{skill.level}/5</div>
                          <div className="text-xs text-muted-foreground">Proficiency</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Competitive Advantages</h3>
                  <ul className="space-y-2">
                    {results.strengths.competitiveAdvantages.map((advantage: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case "gaps":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Gaps</CardTitle>
              <CardDescription>Areas where you could improve to enhance your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: results.gaps.summary }} />
                </div>

                <div className="space-y-4">
                  {results.gaps.identifiedGaps.map((gap: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{gap.skill}</h4>
                            <Badge variant="outline">{gap.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{gap.reason}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium">Priority: {gap.priority}/5</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Market Trends</h3>
                  <ul className="space-y-2">
                    {results.gaps.marketTrends.map((trend: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case "recommendations":
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>Actionable steps to enhance your skill profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: results.recommendations.summary }} />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Learning Resources</h3>
                  <div className="space-y-4">
                    {results.recommendations.learningResources.map((resource: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <h4 className="font-medium">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">{resource.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {resource.skills.map((skill: string, i: number) => (
                                <Badge key={i} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Growth Plan</h3>
                  <div className="space-y-4">
                    {results.recommendations.growthPlan.map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-primary/10 h-8 w-8 rounded-full flex items-center justify-center text-primary font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.timeframe && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Target className="h-3 w-3" />
                              <span>Timeframe: {step.timeframe}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    default:
      return null
  }
}
