"use client"

import { useEffect, useRef } from "react"

interface SkillRadarChartProps {
  skills: any[]
}

export function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !skills || skills.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set dimensions
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Draw radar background
    const levels = 5
    ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
    ctx.fillStyle = "rgba(200, 200, 200, 0.1)"

    for (let i = 1; i <= levels; i++) {
      ctx.beginPath()
      const levelRadius = (radius / levels) * i
      ctx.arc(centerX, centerY, levelRadius, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axes
    const skillCount = skills.length
    if (skillCount === 0) return

    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)"
    for (let i = 0; i < skillCount; i++) {
      const angle = (Math.PI * 2 * i) / skillCount
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle))
      ctx.stroke()

      // Draw skill labels
      const labelRadius = radius + 15
      const skill = skills[i]
      const skillName = skill.skills.name
      ctx.fillStyle = "var(--foreground)"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(skillName, centerX + labelRadius * Math.cos(angle), centerY + labelRadius * Math.sin(angle))
    }

    // Draw data points
    ctx.fillStyle = "rgba(var(--primary), 0.7)"
    ctx.strokeStyle = "rgba(var(--primary), 1)"
    ctx.lineWidth = 2
    ctx.beginPath()

    for (let i = 0; i < skillCount; i++) {
      const angle = (Math.PI * 2 * i) / skillCount
      const skill = skills[i]
      const value = skill.proficiency_level / 5 // Normalize to 0-1
      const pointRadius = radius * value

      if (i === 0) {
        ctx.moveTo(centerX + pointRadius * Math.cos(angle), centerY + pointRadius * Math.sin(angle))
      } else {
        ctx.lineTo(centerX + pointRadius * Math.cos(angle), centerY + pointRadius * Math.sin(angle))
      }
    }

    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw data points
    for (let i = 0; i < skillCount; i++) {
      const angle = (Math.PI * 2 * i) / skillCount
      const skill = skills[i]
      const value = skill.proficiency_level / 5 // Normalize to 0-1
      const pointRadius = radius * value

      ctx.beginPath()
      ctx.arc(centerX + pointRadius * Math.cos(angle), centerY + pointRadius * Math.sin(angle), 4, 0, Math.PI * 2)
      ctx.fillStyle = "var(--background)"
      ctx.fill()
      ctx.strokeStyle = "rgba(var(--primary), 1)"
      ctx.stroke()
    }
  }, [skills])

  if (!skills || skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <p className="text-muted-foreground">No skills data available</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} width={400} height={300} className="max-w-full h-auto" />
    </div>
  )
}
