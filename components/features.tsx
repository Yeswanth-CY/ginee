import { Brain, BarChart, BookOpen, FileText, MessageSquare, Target } from "lucide-react"

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need to Succeed</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Ginee combines AI-powered analysis with personalized guidance to help you achieve your career goals.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Brain className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Skill Analysis</h3>
            <p className="text-center text-muted-foreground">
              Get a detailed analysis of your current skills and identify areas for improvement.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <Target className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Personalized Roadmaps</h3>
            <p className="text-center text-muted-foreground">
              Receive customized learning paths tailored to your career goals and current skill level.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <MessageSquare className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">AI Chat Assistant</h3>
            <p className="text-center text-muted-foreground">
              Chat with Ginee anytime to get instant answers to your career and learning questions.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <BookOpen className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Course Recommendations</h3>
            <p className="text-center text-muted-foreground">
              Discover courses that will help you build the skills you need for your target roles.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <FileText className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Resume Analysis</h3>
            <p className="text-center text-muted-foreground">
              Get feedback on your resume and suggestions to make it stand out to employers.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <BarChart className="h-12 w-12 text-primary" />
            <h3 className="text-xl font-bold">Progress Tracking</h3>
            <p className="text-center text-muted-foreground">
              Monitor your learning progress and celebrate your achievements along the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
