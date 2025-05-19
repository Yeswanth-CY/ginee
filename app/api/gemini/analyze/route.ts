import { NextResponse } from "next/server"
import { analyzeUserData } from "@/lib/data-analysis"

export async function POST(request: Request) {
  try {
    const { userId, query } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user data analysis
    const analysis = await analyzeUserData(userId)

    if (!analysis) {
      return NextResponse.json(
        {
          error: "Insufficient data to provide analysis",
        },
        { status: 400 },
      )
    }

    // In a real implementation, this would call the Gemini API with the analysis data
    // For now, we'll return the analysis directly

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Analysis completed successfully",
    })
  } catch (error: any) {
    console.error("Error analyzing with Gemini:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze data",
      },
      { status: 500 },
    )
  }
}
