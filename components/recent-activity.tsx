import { BookOpen, CheckCircle, FileText, Target } from "lucide-react"

interface RecentActivityProps {
  courses: any[]
}

export function RecentActivity({ courses }: RecentActivityProps) {
  // This would normally include various activities like course completions,
  // skill assessments, etc. For now, we'll use the course data and add some mock activities

  const activities = [
    ...(courses || []).map((course: any) => ({
      id: `course-${course.courses.id}`,
      type: "course",
      title: `Completed "${course.courses.title}" course`,
      date: new Date(course.completion_date),
      score: course.score,
      icon: BookOpen,
    })),
    {
      id: "resume-1",
      type: "resume",
      title: "Updated resume",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      icon: FileText,
    },
    {
      id: "skill-1",
      type: "skill",
      title: "Added new skill: Problem Solving",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      icon: CheckCircle,
    },
    {
      id: "assessment-1",
      type: "assessment",
      title: "Completed interview assessment",
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      icon: Target,
    },
  ]

  // Sort activities by date (newest first)
  const sortedActivities = [...activities].sort((a, b) => b.date.getTime() - a.date.getTime())

  if (!sortedActivities.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No activity recorded yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded">
            <activity.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{activity.title}</p>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {activity.date.toLocaleDateString()} at{" "}
                {activity.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              {activity.type === "course" && <span className="text-sm font-medium">Score: {activity.score}/100</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
