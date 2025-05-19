import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { prompt, userId, context } = await request.json()

    // Check if Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 })
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // Validate user ID
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user data from Supabase if not provided in context
    let userData = context
    if (!userData) {
      const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userError) {
        return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
      }

      userData = { profile: user }
    }

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt, userData, apiKey)

    // Save the conversation to the database
    await supabase.from("chat_history").insert([
      {
        user_id: userId,
        message: prompt,
        is_user: true,
      },
      {
        user_id: userId,
        message: geminiResponse,
        is_user: false,
      },
    ])

    return NextResponse.json({ response: geminiResponse })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

async function callGeminiAPI(prompt: string, userData: any, apiKey: string): Promise<string> {
  try {
    // Update the model to gemini-2.0-flash
    const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    // Prepare the request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are Ginee, a personalized learning assistant. 
              
              User context: ${JSON.stringify(userData)}
              
              User message: ${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }

    // Make the API call
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()

    // Extract the response text
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response at this time."

    return responseText
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    return "I'm sorry, I encountered an error processing your request. Please try again later."
  }
}
