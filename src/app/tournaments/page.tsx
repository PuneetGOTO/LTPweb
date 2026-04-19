"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"
import { Trophy } from "lucide-react"

export default function TournamentsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 pt-24 pb-24 flex items-center justify-center">
        <div className="bg-black/60 backdrop-blur-xl p-12 rounded-2xl border border-accent/20 flex flex-col items-center shadow-[0_0_50px_rgba(255,0,170,0.15)] text-center max-w-2xl">
          <Trophy className="w-24 h-24 text-accent mb-6 opacity-80" />
          <h1 className="text-4xl font-black font-orbitron mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">{t('tournaments.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('tournaments.wip')}</p>
        </div>
      </main>
    </div>
  )
}
