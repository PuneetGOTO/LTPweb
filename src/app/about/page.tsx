"use client"

import { Navbar } from "@/components/Navbar"
import { useLanguage } from "@/contexts/LanguageContext"

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col relative w-full">
       <Navbar />
       {/* Background Grid */}
       <div className="absolute top-0 left-0 w-full h-[60%] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none" />
       
       <div className="flex-1 max-w-5xl mx-auto p-4 md:p-8 pt-20 md:pt-24 text-center relative z-10">
         <h1 className="text-4xl md:text-7xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-6 leading-tight drop-shadow-2xl">
           <span className="block">{t('about.title1')}</span>
           <span className="block">{t('about.title2')}</span>
         </h1>
         <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed mb-16 max-w-3xl mx-auto">
            {t('about.desc')}
         </p>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-left">
           <div className="bg-card backdrop-blur-lg border border-border p-6 md:p-8 rounded-2xl shadow-[0_0_30px_rgba(0,245,255,0.1)] hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-6 border border-primary/50">
                 <span className="font-orbitron font-bold text-primary">{t('about.box1.num')}</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">{t('about.box1.title')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('about.box1.desc')}</p>
           </div>
           
           <div className="bg-card backdrop-blur-lg border border-border p-6 md:p-8 rounded-2xl shadow-[0_0_30px_rgba(255,0,170,0.1)] hover:border-accent/50 transition-colors">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-6 border border-accent/50">
                 <span className="font-orbitron font-bold text-accent">{t('about.box2.num')}</span>
              </div>
              <h3 className="text-xl font-bold text-accent mb-3">{t('about.box2.title')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('about.box2.desc')}</p>
           </div>

           <div className="bg-card backdrop-blur-lg border border-border p-6 md:p-8 rounded-2xl hover:border-border0 transition-colors">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-6 border border-border">
                 <span className="font-orbitron font-bold text-foreground text-sm">{t('about.box3.num')}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t('about.box3.title')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('about.box3.desc')}</p>
           </div>
         </div>
       </div>
    </div>
  )
}
