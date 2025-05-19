import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Meet Ginee, Your Personal Learning Assistant
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Personalized upskilling and career guidance powered by AI. Analyze your skills, get tailored
                recommendations, and achieve your career goals.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full min-[400px]:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] lg:h-[500px] lg:w-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
              <div className="relative h-full w-full bg-muted rounded-xl overflow-hidden border shadow-xl">
                <div className="flex flex-col h-full">
                  <div className="bg-background p-4 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm font-medium">Ginee Chat</div>
                    <div className="w-16"></div>
                  </div>
                  <div className="flex-1 p-4 overflow-auto space-y-4">
                    <div className="flex items-start gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        G
                      </div>
                      <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                        <p>Hi there! I'm Ginee, your personal learning assistant. How can I help you today?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm justify-end">
                      <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none">
                        <p>Can I crack the TCS NQT with my current skills?</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                        U
                      </div>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        G
                      </div>
                      <div className="bg-muted p-3 rounded-lg rounded-tl-none">
                        <p>
                          Based on your profile, you have a good foundation in JavaScript and SQL. For TCS NQT, I
                          recommend focusing on Data Structures and Algorithms. Let me create a personalized study plan
                          for you...
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border rounded-md">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="w-full px-3 py-2 bg-transparent focus:outline-none"
                        />
                      </div>
                      <Button size="sm">Send</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
