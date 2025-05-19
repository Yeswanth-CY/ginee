import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award } from "lucide-react"

interface CertificationsSectionProps {
  certifications: any[]
}

export function CertificationsSection({ certifications }: CertificationsSectionProps) {
  if (!certifications || certifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <p className="text-muted-foreground">No certifications available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload your resume to automatically extract your certifications
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {certifications.map((cert, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{cert.name}</CardTitle>
                <CardDescription>{cert.issuer}</CardDescription>
              </div>
              <div className="bg-primary/10 p-2 rounded">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Issued: {formatDate(cert.issue_date)}</span>
                {cert.expiry_date && (
                  <span className="text-sm font-medium">Expires: {formatDate(cert.expiry_date)}</span>
                )}
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
