"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, MessageSquare, FileText, User, Briefcase, BarChart } from "lucide-react"

// Update the navItems array to include the skill analysis page
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Chat with Ginee",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Resume",
    href: "/dashboard/resume",
    icon: FileText,
  },
  {
    title: "Career",
    href: "/dashboard/career",
    icon: Briefcase,
  },
  {
    title: "Skill Analysis",
    href: "/dashboard/skills/analysis",
    icon: BarChart,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
            pathname === item.href ? "bg-accent" : "transparent",
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
