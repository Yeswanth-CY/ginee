import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Success Stories</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See how Ginee has helped students and professionals achieve their career goals.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage alt="Yeswanth" src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>YS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">Yeswanth</p>
                  <p className="text-sm text-muted-foreground">Software Developer</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "Ginee helped me identify the skills I needed to improve for my TCS interview. I followed the
                personalized roadmap and got selected!"
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage alt="Haridra" src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>HR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">Haridra</p>
                  <p className="text-sm text-muted-foreground">Data Scientist</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "The AI-powered recommendations were spot on. Ginee suggested courses that perfectly matched my learning
                style and career goals."
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage alt="Swethaa" src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>SW</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">Swethaa</p>
                  <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                "I was stuck in my career progression until I found Ginee. The personalized advice helped me upskill and
                land a better role."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
