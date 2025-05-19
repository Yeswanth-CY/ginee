import { CheckCircle2 } from "lucide-react"

interface UpcomingMilestonesProps {
  metrics: any
}

export function UpcomingMilestones({ metrics }: UpcomingMilestonesProps) {
  // This would normally be generated based on the user's progress
  // For now, we'll use some static milestones
  const milestones = [
    {
      id: 1,
      title: "Complete Data Structures Course",
      progress: 75,
      dueDate: "May 30, 2025",
    },
    {
      id: 2,
      title: "Improve Resume Score to 85+",
      progress: metrics?.resume_score >= 85 ? 100 : (metrics?.resume_score / 85) * 100,
      dueDate: "June 15, 2025",
    },
    {
      id: 3,
      title: "Practice 10 Mock Interviews",
      progress: 30,
      dueDate: "July 10, 2025",
    },
  ]

  return (
    <div className="space-y-4">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {milestone.progress >= 100 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span className="text-sm font-medium">{milestone.title}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{milestone.progress >= 100 ? "Completed" : `${Math.round(milestone.progress)}%`}</span>
            <span>Due: {milestone.dueDate}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(milestone.progress, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
