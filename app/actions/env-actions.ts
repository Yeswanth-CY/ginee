"use server"

export async function setGeminiApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if the key is already set in the environment
    if (process.env.GEMINI_API_KEY) {
      // Key is already set, return success
      return { success: true }
    }

    // In a real production environment, you would store this in a more secure way
    // For this demo, we'll use a server-side environment variable
    process.env.GEMINI_API_KEY = apiKey

    // Return success
    return { success: true }
  } catch (error: any) {
    console.error("Error setting API key:", error)
    return { success: false, error: error.message || "Failed to set API key" }
  }
}
