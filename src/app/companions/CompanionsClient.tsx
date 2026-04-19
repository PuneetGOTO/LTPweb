"use client"

import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { Users, Star } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

export default function CompanionsClient({ companions }: { companions: any[] }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pt-12 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black font-orbitron text-accent drop-shadow-[0_0_10px_rgba(255,0,170,0.4)] mb-2">
          {t('comp.list.title')}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mb-12">{t('comp.list.sub')}</p>

        {companions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-xl text-muted-foreground font-semibold">{t('home.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {companions.map(companion => (
              <Link href={`/companion/${companion.id}`} key={companion.id} className="group relative flex flex-col bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-accent/50 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(255,0,170,0.15)]">
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {companion.profile?.avatarUrl ? (
                     <img src={companion.profile.avatarUrl} alt={companion.username} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-gradient-to-br from-black to-slate-900 shadow-inner">
                       <Users className="w-12 h-12 text-muted-foreground mb-2" />
                       <span className="font-orbitron tracking-widest text-lg font-bold">{companion.username}</span>
                     </div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur border border-white/10 rounded px-2 py-1 flex items-center gap-1 z-10">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-white">{companion.profile?.rating?.toFixed(1) || "5.0"}</span>
                  </div>
                  {companion.profile?.isOnline ? (
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-bold text-white drop-shadow-md">{t('companion.online')}</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                      <span className="relative flex h-3 w-3 bg-gray-500 rounded-full"></span>
                      <span className="text-xs font-bold text-white drop-shadow-md">{t('companion.offline')}</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col h-full bg-gradient-to-t from-black via-black/80 to-transparent">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl leading-tight truncate font-orbitron text-white">{companion.username}</h3>
                    <span className="font-bold text-primary shrink-0">${companion.profile?.hourlyRate || 150}</span>
                  </div>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {(companion.profile?.games || "Valorant").split(',').map((g: string) => (
                      <span key={g} className="text-[10px] px-2 border border-white/10 rounded-sm text-muted-foreground uppercase">{g.trim()}</span>
                    ))}
                  </div>
                  <div className="mt-auto w-full py-2 border border-accent/50 text-accent font-bold text-center rounded text-sm tracking-widest group-hover:bg-accent group-hover:text-black transition-colors block">
                    {t('nav.companions')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
