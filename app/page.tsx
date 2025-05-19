import { HeroSection } from "@/components/hero-section"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <Features />
        <Testimonials />
      </main>
      <SiteFooter />
    </div>
  )
}
