"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { Globe, User as UserIcon, Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

export function Navbar({ overlay = false }: { overlay?: boolean }) {
  const { t, toggleLanguage } = useLanguage()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const avatarUrl = (session?.user as any)?.avatarUrl
  const username = (session?.user as any)?.username

  const AvatarBadge = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const dims = size === "lg" ? "w-10 h-10" : "w-7 h-7"
    return (
      <div className={`${dims} rounded-full overflow-hidden border border-primary/50 bg-white/5 flex-shrink-0 flex items-center justify-center`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={(session?.user as any)?.displayName || username} className="w-full h-full object-cover" />
        ) : (
          <UserIcon className={`${size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-white/40`} />
        )}
      </div>
    )
  }

  return (
    <nav className={`w-full px-4 md:px-8 py-4 md:py-6 flex justify-between items-center z-50 glass-header border-b border-white/5 bg-black/40 backdrop-blur-md ${overlay ? 'absolute top-0' : 'sticky top-0'}`}>
      <Link href="/" className="text-3xl font-orbitron font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(0,245,255,0.7)] z-50">
        LTP
      </Link>
      
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden z-50 text-white p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 text-sm font-semibold tracking-wide hover:text-primary transition-colors border border-white/20 rounded-full px-3 py-1"
        >
          <Globe className="w-4 h-4" />
          {t('lang.toggle')}
        </button>
        <Link href="/about" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors">{t('nav.about')}</Link>
        <Link href="/faq" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors">{t('nav.faq')}</Link>
        <Link href="/companions" className="text-sm font-semibold tracking-wide text-accent hover:text-accent/80 transition-colors">{t('nav.companions')}</Link>
        <Link href="/video-hub" className="text-sm font-semibold tracking-wide hover:text-primary transition-colors">{t('nav.videohub')}</Link>
        
        {status === "loading" ? (
          <div className="w-20 h-8 rounded-full bg-white/10 animate-pulse"></div>
        ) : session ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-bold text-white hover:text-primary transition-colors">
               {t('nav.dashboard')}
            </Link>
            {(session?.user as any)?.role === 'ADMIN' && (
               <Link href="/admin" className="text-sm font-bold text-accent hover:text-accent/80 transition-colors">
                 {t('nav.admin')}
               </Link>
            )}
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors">
               {t('nav.logout')}
            </button>
            <Link href="/dashboard" className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/50 font-bold tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-colors">
              <AvatarBadge />
              {username}
            </Link>
          </div>
        ) : (
          <Link href="/login" className="px-6 py-2 rounded-full bg-primary/10 text-primary border border-primary/50 hover:bg-primary hover:text-black transition-all font-bold tracking-widest shadow-[0_0_15px_rgba(0,245,255,0.3)] hover:shadow-[0_0_25px_rgba(0,245,255,0.8)] flex items-center gap-2">
            {t('nav.login')}
          </Link>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 md:hidden">
          <button 
            onClick={() => { toggleLanguage(); setMobileMenuOpen(false); }}
            className="flex items-center gap-2 text-xl font-semibold tracking-wide hover:text-primary transition-colors border border-white/20 rounded-full px-6 py-2"
          >
            <Globe className="w-5 h-5" />
            {t('lang.toggle')}
          </button>
          
          <Link onClick={() => setMobileMenuOpen(false)} href="/about" className="text-2xl font-bold tracking-wide hover:text-primary transition-colors">{t('nav.about')}</Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/faq" className="text-2xl font-bold tracking-wide hover:text-primary transition-colors">{t('nav.faq')}</Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/companions" className="text-2xl font-bold tracking-wide text-accent">{t('nav.companions')}</Link>
          <Link onClick={() => setMobileMenuOpen(false)} href="/video-hub" className="text-2xl font-bold tracking-wide hover:text-primary transition-colors">{t('nav.videohub')}</Link>
          
          <div className="w-32 h-[1px] bg-white/10 my-4" />
          
          {session ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50 bg-white/5 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-white/30" />
                  )}
                </div>
                <span className="text-primary font-bold tracking-widest">{username}</span>
              </div>
              <Link onClick={() => setMobileMenuOpen(false)} href="/dashboard" className="text-2xl font-bold hover:text-primary transition-colors">
                {t('nav.dashboard')}
              </Link>
              {(session?.user as any)?.role === 'ADMIN' && (
                <Link onClick={() => setMobileMenuOpen(false)} href="/admin" className="text-2xl font-bold text-accent">
                  {t('nav.admin')}
                </Link>
              )}
              <button 
                onClick={() => { signOut({ callbackUrl: "/login" }); setMobileMenuOpen(false); }} 
                className="text-xl font-bold text-muted-foreground hover:text-destructive transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link onClick={() => setMobileMenuOpen(false)} href="/login" className="px-8 py-3 rounded-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-black transition-all font-bold tracking-widest text-xl">
              {t('nav.login')}
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
