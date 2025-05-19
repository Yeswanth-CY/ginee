import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { message, userId, resumeData } = await request.json()

    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // Handle resume parsing if resumeData is provided
    if (resumeData) {
      // In a real implementation, this would call the Gemini Flash 2.0 API
      // to parse the resume and extract information

      // For now, we'll return a mock response
      return NextResponse.json({
        success: true,
        data: {
          skills: [
            { name: "Python", category: "Programming", proficiency: 5 },
            { name: "Machine Learning", category: "AI", proficiency: 4 },
            { name: "React", category: "Frontend", proficiency: 4 },
          ],
          education: [
            {
              institution: "Stanford University",
              degree: "BS in Computer Science",
              startDate: "2018-09-01",
              endDate: "2022-05-30",
              gpa: "3.8",
            },
          ],
          certifications: [
            {
              name: "AWS Certified Solutions Architect",
              issuer: "Amazon Web Services",
              issueDate: "2023-03-15",
              expiryDate: "2026-03-15",
            },
          ],
          projects: [
            {
              name: "AI-Powered Health Monitoring System",
              description: "Developed a real-time health monitoring system using machine learning algorithms",
              role: "Team Lead",
              date: "2023-06-15",
            },
          ],
        },
      })
    }

    // Handle chat message
    if (!message || !userId) {
      return NextResponse.json({ error: "Message and userId are required" }, { status: 400 })
    }

    // Get user data from Supabase
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
    }

    // Get user metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (metricsError && metricsError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to fetch user metrics" }, { status: 500 })
    }

    // Get user skills
    const { data: skillsData, error: skillsError } = await supabase
      .from("user_skills")
      .select(`
        proficiency_level,
        skills (
          name,
          category
        )
      `)
      .eq("user_id", userId)

    if (skillsError) {
      return NextResponse.json({ error: "Failed to fetch user skills" }, { status: 500 })
    }

    // Get education data
    const { data: educationData, error: educationError } = await supabase
      .from("user_education")
      .select("*")
      .eq("user_id", userId)

    if (educationError) {
      return NextResponse.json({ error: "Failed to fetch education data" }, { status: 500 })
    }

    // In a real implementation, this would call the Gemini Flash 2.0 API
    // with the user data and message

    // Simulate a response based on the message content
    let response = ""

    if (message.toLowerCase().includes("tcs") || message.toLowerCase().includes("nqt")) {
      response = `Based on your profile, I can see you have a good foundation in JavaScript and React, which is great for the TCS NQT. 

Here's my assessment:
- Your resume score is ${metricsData?.resume_score || "N/A"}/100
- Your interview score is ${metricsData?.interview_score || "N/A"}/100
- You've completed several relevant courses

To increase your chances of selection for TCS NQT, I recommend:
1. Complete the Data Structures and Algorithms course (this is critical for the coding section)
2. Improve your SQL skills
3. Practice at least 20 mock interview questions focused on JavaScript and data structures

Would you like me to create a detailed study plan for you?`
    } else if (message.toLowerCase().includes("education") || message.toLowerCase().includes("degree")) {
      if (educationData && educationData.length > 0) {
        const edu = educationData[0]
        response = `I can see from your profile that you studied at ${edu.institution} and earned a ${edu.degree}. 
        
This is a strong educational background that will be valuable in your career journey. Would you like me to suggest some courses that would complement your degree?`
      } else {
        response = `I don't see any education information in your profile yet. You can upload your resume to automatically extract your education history, or you can add it manually in your profile settings.

Would you like me to help you with that?`
      }
    } else {
      response = `Thank you for your message. I'm here to help with your learning and career development. 

Based on your profile, I can see you're focusing on web development skills. Is there a specific area you'd like guidance on? For example:
- Technical interview preparation
- Skill development recommendations
- Course suggestions
- Resume improvement
- Career path planning

Let me know how I can assist you!`
    }

    // Save the conversation to the database
    await supabase.from("chat_history").insert([
      {
        user_id: userId,
        message,
        is_user: true,
      },
      {
        user_id: userId,
        message: response,
        is_user: false,
      },
    ])

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
