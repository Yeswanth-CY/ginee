import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

interface RecommendedCoursesProps {
  skills: any[]
}

export function RecommendedCourses({ skills }: RecommendedCoursesProps) {
  // This would normally be based on the user's skills and goals
  // For now, we'll use some static recommendations
  const recommendations = [
    {
      id: 1,
      title: "Advanced Data Structures",
      description: "Master complex data structures for technical interviews",
      level: "Intermediate",
      match: "95% match for your goals",
    },
    {
      id: 2,
      title: "System Design Fundamentals",
      description: "Learn how to design scalable systems",
      level: "Advanced",
      match: "90% match for your goals",
    },
    {
      id: 3,
      title: "Technical Interview Preparation",
      description: "Practice common interview questions and techniques",
      level: "Intermediate",
      match: "88% match for your goals",
    },
  ]

  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">Add skills to get personalized course recommendations</p>
        <Link href="/dashboard/skills">
          <Button variant="outline">Add Skills</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((course) => (
        <div key={course.id} className="flex items-start gap-4 p-4 border rounded-lg">
          <div className="bg-primary/10 p-2 rounded">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between">
              <h4 className="font-medium">{course.title}</h4>
              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                {course.match}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{course.description}</p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-muted-foreground">{course.level}</span>
              <Button variant="outline" size="sm">
                Enroll
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
