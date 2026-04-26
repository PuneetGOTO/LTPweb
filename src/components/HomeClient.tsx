"use client"

import { motion } from "framer-motion"
import { PlayCircle, Flame, Users, Star } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"

export default function HomeClient({ topCompanions }: { topCompanions: any[] }) {
  const { t } = useLanguage()

  return (
    <main className="flex-1 flex flex-col items-center bg-background min-h-screen relative overflow-x-hidden">
      <Navbar overlay={true} />
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-20">
        <div className="z-10 flex flex-col items-center text-center px-4 max-w-5xl">
          {/* HUGE BLURRED BACKGROUND TEXT "LTP" */}
          <div className="absolute font-black font-orbitron text-[38vw] tracking-tighter text-foreground/5 blur-[8px] pointer-events-none select-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] dark:drop-shadow-none" style={{ lineHeight: 0.8 }}>
             LTP
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-accent/40 backdrop-blur-md shadow-[0_0_15px_rgba(255,0,170,0.3)] relative z-10"
          >
            <Flame className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-accent">{t('hero.tag')}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-8xl font-black font-orbitron tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-foreground via-primary to-accent drop-shadow-2xl relative z-10"
          >
            {t('hero.title')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl mb-10 font-light relative z-10"
          >
            {t('hero.desc')}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 relative z-10"
          >
            <Link href="/select-service" className="group relative px-6 md:px-8 py-4 bg-accent text-white font-bold text-lg rounded-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,0,170,0.5)] w-full sm:w-auto text-center flex justify-center">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-center gap-2 relative z-10">
                <Users className="w-6 h-6" />
                {t('hero.enter')}
              </div>
            </Link>
            
            <Link href="/video-hub" className="px-6 md:px-8 py-4 bg-secondary hover:bg-secondary/80 text-foreground border border-border font-bold text-lg rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 backdrop-blur-md w-full sm:w-auto">
              <PlayCircle className="w-6 h-6 text-primary" />
              {t('nav.videohub')}
            </Link>
          </motion.div>
        </div>

        {/* Decorative Grid Floor */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:linear-gradient(to_top,black,transparent)] pointer-events-none" style={{ perspective: "1000px", transform: "rotateX(60deg) scale(2.5)", transformOrigin: "bottom" }} />
      </section>

      {/* Top Companions Section */}
      <section className="w-full max-w-7xl mx-auto py-24 px-4 md:px-8 relative z-20">
        <h2 className="text-3xl md:text-4xl font-black font-orbitron text-foreground decoration-accent drop-shadow-[0_0_15px_rgba(255,0,170,0.5)] dark:drop-shadow-none mb-2 md:inline-block border-b-4 border-accent pb-2 text-center md:text-left">
          {t('home.top.companions')}
        </h2>
        <p className="text-muted-foreground mb-10 text-base md:text-lg text-center md:text-left">{t('home.top.desc')}</p>
        
        {topCompanions.length === 0 ? (
           <div className="p-12 text-center border border-border bg-secondary rounded-xl backdrop-blur-md">
              <p className="text-muted-foreground">{t('home.empty')}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             {topCompanions.map(companion => (
                <Link href={`/companion/${companion.id}`} key={companion.id} className="group flex flex-col bg-background/60 border border-border rounded-2xl overflow-hidden hover:border-accent/60 transition-all hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(255,0,170,0.2)]">
                  <div className="h-48 bg-secondary relative flex items-center justify-center">
                    {companion.profile?.avatarUrl ? (
                      <img src={companion.profile.avatarUrl} alt={companion.username} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-secondary to-background flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-accent/50 mb-2" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur border border-border rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-foreground">{companion.profile?.rating?.toFixed(1) || "5.0"}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold font-orbitron tracking-wider text-foreground mb-1 group-hover:text-accent transition-colors">{companion.username}</h3>
                    <p className="text-sm text-primary mb-4 font-semibold">${companion.profile?.hourlyRate || 150} {t('companion.rate')}</p>
                    
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {(companion.profile?.games || "Valorant").split(',').map((g: string) => (
                        <span key={g} className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground border border-border">{g.trim()}</span>
                      ))}
                    </div>
                    
                    <div className="w-full text-center py-2 bg-secondary text-foreground/70 font-bold rounded group-hover:bg-accent group-hover:text-white transition-all text-sm tracking-widest mt-auto">
                      {t('companion.book')}
                    </div>
                  </div>
                </Link>
             ))}
          </div>
        )}
      </section>

    </main>
  )
}
