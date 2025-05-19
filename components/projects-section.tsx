import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, ExternalLink } from "lucide-react"

interface ProjectsSectionProps {
  projects: any[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">No projects or hackathons available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your resume to automatically extract your projects and hackathons
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.role}</CardDescription>
              </div>
              <div className="bg-primary/10 p-2 rounded">
                <Code className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{project.date ? formatDate(project.date) : ""}</span>
              </div>
            </div>
          </CardContent>
          {project.url && (
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Project
                </a>
              </Button>
            </CardFooter>
          )}
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
