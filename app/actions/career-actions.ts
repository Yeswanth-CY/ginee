"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { analyzeUserData, type CareerAnalysis } from "@/lib/data-analysis"
import { revalidatePath } from "next/cache"

export async function getCareerRecommendations(userId: string): Promise<{
  success: boolean
  data?: CareerAnalysis
  error?: string
}> {
  try {
    const analysis = await analyzeUserData(userId)

    if (!analysis) {
      return {
        success: false,
        error: "Insufficient data to provide recommendations. Please add more skills to your profile.",
      }
    }

    return {
      success: true,
      data: analysis,
    }
  } catch (error: any) {
    console.error("Error getting career recommendations:", error)
    return {
      success: false,
      error: error.message || "Failed to generate career recommendations",
    }
  }
}

export async function saveJobPreference(
  userId: string,
  jobTitle: string,
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()

    // Update or insert user preferences
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      target_job_role: jobTitle,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    // Revalidate relevant paths
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/career")

    return { success: true }
  } catch (error: any) {
    console.error("Error saving job preference:", error)
    return {
      success: false,
      error: error.message || "Failed to save job preference",
    }
  }
}

export async function generateStudyPlan(
  userId: string,
  jobTitle: string,
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  try {
    // First get the career analysis
    const { success, data: analysis, error } = await getCareerRecommendations(userId)

    if (!success || !analysis) {
      return { success: false, error: error || "Failed to analyze career data" }
    }

    // Find the job recommendation that matches the selected job title
    const jobRec = analysis.jobRecommendations.find((job) => job.title === jobTitle)

    if (!jobRec) {
      return { success: false, error: "Job role not found in recommendations" }
    }

    // Generate a study plan based on the job's missing skills and course recommendations
    const relevantCourses = analysis.courseRecommendations.filter((course) =>
      jobRec.missingSkills.some((skill) => course.skillsCovered.includes(skill.skillName)),
    )

    // Create a structured study plan
    const studyPlan = {
      jobTitle,
      matchScore: jobRec.matchScore,
      overview: `This study plan is designed to help you become a ${jobTitle} by focusing on the skills you need to develop.`,
      timeframe: "3-6 months",
      skillsToFocus: jobRec.missingSkills.map((skill) => ({
        name: skill.skillName,
        priority: skill.importance,
        currentLevel: skill.currentLevel || 0,
        targetLevel: skill.recommendedLevel,
      })),
      recommendedCourses: relevantCourses,
      milestones: [
        {
          title: "Foundation Building",
          description: "Master the fundamental skills required for the role",
          duration: "4 weeks",
          tasks: jobRec.missingSkills
            .filter((skill) => skill.importance >= 4)
            .map((skill) => `Learn ${skill.skillName} basics`),
        },
        {
          title: "Skill Development",
          description: "Deepen your knowledge in key areas",
          duration: "8 weeks",
          tasks: [
            "Complete recommended courses",
            "Build small projects to practice skills",
            "Participate in coding challenges",
          ],
        },
        {
          title: "Project Building",
          description: "Apply your skills to real-world projects",
          duration: "6 weeks",
          tasks: [
            "Build a portfolio project showcasing your skills",
            "Contribute to open source projects",
            "Document your learning journey",
          ],
        },
        {
          title: "Interview Preparation",
          description: "Prepare for technical interviews",
          duration: "4 weeks",
          tasks: [
            "Practice technical interview questions",
            "Prepare your resume and portfolio",
            "Research companies and roles",
          ],
        },
      ],
    }

    // Save the study plan to the database
    const supabase = createServerSupabaseClient()

    const { error: saveError } = await supabase.from("user_study_plans").upsert({
      user_id: userId,
      job_title: jobTitle,
      plan_data: studyPlan,
      created_at: new Date().toISOString(),
    })

    if (saveError) throw saveError

    return {
      success: true,
      data: studyPlan,
    }
  } catch (error: any) {
    console.error("Error generating study plan:", error)
    return {
      success: false,
      error: error.message || "Failed to generate study plan",
    }
  }
}
