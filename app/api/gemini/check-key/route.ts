import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the Gemini API key is configured
    const apiKey = process.env.GEMINI_API_KEY

    return NextResponse.json({
      configured: !!apiKey,
    })
  } catch (error: any) {
    console.error("Error checking API key:", error)
    return NextResponse.json({ error: error.message || "Failed to check API key" }, { status: 500 })
  }
}
