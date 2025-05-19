import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { School } from "lucide-react"

interface EducationSectionProps {
  education: any[]
}

export function EducationSection({ education }: EducationSectionProps) {
  if (!education || education.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">No education information available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your resume to automatically extract your education history
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {education.map((edu, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{edu.institution}</CardTitle>
                <CardDescription>{edu.degree}</CardDescription>
              </div>
              <div className="bg-primary/10 p-2 rounded">
                <School className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {formatDate(edu.start_date)} - {edu.end_date ? formatDate(edu.end_date) : "Present"}
                </span>
                {edu.gpa && <span className="text-sm font-medium">GPA: {edu.gpa}</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatDate(dateString: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}
