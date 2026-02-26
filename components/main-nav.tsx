"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, BarChart3, UploadCloud } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const links = [
    { href: "/",               label: "Portal",           icon: LayoutGrid  },
    { href: "/health",         label: "Health Dashboard", icon: BarChart3   },
    { href: "/health/upload",  label: "Upload & Predict", icon: UploadCloud },
  ]

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === href ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
        </Link>
      ))}
    </nav>
  )
}
