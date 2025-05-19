"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function analyzeSkills(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

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
      .eq("user_id", userId)

    if (skillsError) {
      console.error("Error fetching skills data:", skillsError)
      return { success: false, error: "Failed to fetch skills data" }
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, error: "Failed to fetch user data" }
    }

    // Process skills data
    const skills = skillsData.map((skill) => ({
      name: skill.skills.name,
      category: skill.skills.category,
      level: skill.proficiency_level,
    }))

    // Get education data
    const { data: educationData } = await supabase.from("user_education").select("*").eq("user_id", userId)

    // Get experience data
    const { data: experienceData } = await supabase.from("user_experience").select("*").eq("user_id", userId)

    // Call Gemini API for skill analysis
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return { success: false, error: "Gemini API key is not configured" }
    }

    // Construct the prompt for skill analysis
    const prompt = `
      You are Ginee, an AI-powered personalized learning assistant specialized in skill analysis.
      
      User Profile:
      ${JSON.stringify(userData)}
      
      User Skills:
      ${JSON.stringify(skills)}
      
      ${educationData && educationData.length > 0 ? `User Education: ${JSON.stringify(educationData)}` : ""}
      
      ${experienceData && experienceData.length > 0 ? `User Experience: ${JSON.stringify(experienceData)}` : ""}
      
      Please provide a comprehensive analysis of the user's skills including:
      1. Skill strengths and weaknesses
      2. Skill gaps based on their career path or industry
      3. Recommendations for skill improvement
      4. Potential career paths based on their current skill set
      5. Industry demand for their skills
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "A brief summary of their overall skill profile",
        "strengths": ["List of skill strengths"],
        "weaknesses": ["List of skill weaknesses or gaps"],
        "recommendations": ["List of specific recommendations for improvement"],
        "careerPaths": ["List of potential career paths"],
        "industryDemand": {
          "high": ["Skills with high demand"],
          "medium": ["Skills with medium demand"],
          "low": ["Skills with low demand"]
        }
      }
    `

    // Update the model to gemini-2.0-flash
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more structured output
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Increased token limit for detailed analysis
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      return { success: false, error: "Failed to analyze skills" }
    }

    const data = await response.json()
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!analysisText) {
      return { success: false, error: "No analysis generated" }
    }

    // Extract JSON from the response
    let analysisData
    try {
      // Find JSON in the response text (it might be surrounded by markdown code blocks)
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || analysisText.match(/({[\s\S]*})/)
      const jsonString = jsonMatch ? jsonMatch[1] : analysisText
      analysisData = JSON.parse(jsonString.trim())
    } catch (error) {
      console.error("Error parsing analysis JSON:", error, "Raw text:", analysisText)
      // If parsing fails, use the raw text as the summary
      analysisData = {
        summary: analysisText,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        careerPaths: [],
        industryDemand: {
          high: [],
          medium: [],
          low: [],
        },
      }
    }

    // Save the analysis to the database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from("user_skill_analyses")
      .insert({
        user_id: userId,
        analysis_data: analysisData,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving analysis:", saveError)
      return { success: false, error: "Failed to save analysis" }
    }

    // Revalidate the skills page
    revalidatePath("/dashboard/skills/analysis")

    return {
      success: true,
      analysis: analysisData,
      analysisId: savedAnalysis.id,
    }
  } catch (error) {
    console.error("Error analyzing skills:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getLatestSkillAnalysis(userId: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("user_skill_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no analysis found, return null (not an error)
      if (error.code === "PGRST116") {
        return { success: true, analysis: null }
      }
      console.error("Error fetching skill analysis:", error)
      return { success: false, error: "Failed to fetch skill analysis" }
    }

    return { success: true, analysis: data }
  } catch (error) {
    console.error("Error getting skill analysis:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
