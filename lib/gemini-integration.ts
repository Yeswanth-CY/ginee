// Import directly from supabase-js at the top of the file
import { createClient } from "@supabase/supabase-js"

interface GeminiRequest {
  prompt: string
  userId: string
  context?: any
}

interface GeminiResponse {
  text: string
  data?: any
}

// Function to query Gemini API
export async function queryGemini({ prompt, userId, context }: GeminiRequest): Promise<GeminiResponse> {
  try {
    // Get user data to provide context
    const userData = await getUserData(userId)

    // Combine user data with any additional context
    const fullContext = {
      ...userData,
      ...context,
    }

    // Call the Gemini API through our server endpoint
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        userId,
        context: fullContext,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to get response from Gemini")
    }

    const data = await response.json()

    // Save the conversation to the database (this is now handled by the API route)

    return {
      text: data.response,
      data: data.data,
    }
  } catch (error) {
    console.error("Error querying Gemini:", error)
    return {
      text: "I'm sorry, I encountered an error processing your request. Please try again later.",
    }
  }
}

// Create a singleton Supabase client for the browser
function createSupabaseClient() {
  // Get the Supabase URL and anon key from the environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  // Create and return the client
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Helper function to get user data
async function getUserData(userId: string): Promise<any> {
  // Create the Supabase client
  const supabase = createSupabaseClient()

  // Get user profile
  const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

  if (userError) {
    console.error("Error fetching user data:", userError)
    return {}
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
    .eq("user_id", userId)

  if (skillsError) {
    console.error("Error fetching skills data:", skillsError)
    return { profile: userData }
  }

  // Get user metrics
  const { data: metricsData, error: metricsError } = await supabase
    .from("user_metrics")
    .select("*")
    .eq("user_id", userId)
    .single()

  // It's okay if metrics don't exist yet

  // Get education data
  const { data: educationData, error: educationError } = await supabase
    .from("user_education")
    .select("*")
    .eq("user_id", userId)

  if (educationError) {
    console.error("Error fetching education data:", educationError)
    return { profile: userData, skills: skillsData }
  }

  // Get experience data
  const { data: experienceData, error: experienceError } = await supabase
    .from("user_experience")
    .select("*")
    .eq("user_id", userId)

  if (experienceError) {
    console.error("Error fetching experience data:", experienceError)
    return { profile: userData, skills: skillsData, education: educationData }
  }

  // Process skills data
  const skills = skillsData.map((skill) => ({
    name: skill.skills.name,
    category: skill.skills.category,
    level: skill.proficiency_level,
  }))

  return {
    profile: userData,
    skills,
    metrics: metricsData || null,
    education: educationData || [],
    experience: experienceData || [],
  }
}
