"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Video, Users, CreditCard, Settings } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AdminNavClient() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const links = [
    { href: "/admin", icon: LayoutDashboard, label: t('admin.nav.dashboard') },
    { href: "/admin/videos", icon: Video, label: t('admin.nav.videos') },
    { href: "/admin/users", icon: Users, label: t('admin.nav.users') },
    { href: "/admin/orders", icon: CreditCard, label: t('admin.nav.orders') },
    { href: "/admin/pricing", icon: Settings, label: "Pricing / 定價" },
  ]

  return (
    <nav className="flex-1 px-4 space-y-2">
      {links.map(link => {
        const Icon = link.icon
        const active = pathname === link.href
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold tracking-wide ${active ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(0,245,255,0.2)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
          >
            <Icon className="w-5 h-5" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
