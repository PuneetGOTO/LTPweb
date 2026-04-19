"use client"

import { Navbar } from "@/components/Navbar"
import { useLanguage } from "@/contexts/LanguageContext"

export default function FAQPage() {
  const { t } = useLanguage()

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative w-full">
       <Navbar />
       <div className="max-w-4xl mx-auto w-full p-8 pt-24 z-10 relative">
         <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-12 text-primary border-b border-primary/20 pb-6 drop-shadow-[0_0_10px_rgba(0,245,255,0.3)]">
           {t('faq.title')}
         </h1>
         <div className="space-y-6">
           {faqs.map((f, i) => (
             <div key={i} className="bg-black/60 backdrop-blur-lg border border-white/10 p-6 rounded-xl hover:border-primary/30 transition-colors">
               <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-3 leading-tight">
                 <span className="text-primary font-orbitron text-xs px-2 py-1 bg-primary/10 rounded shrink-0">Q</span>
                 {f.q}
               </h3>
               <p className="text-muted-foreground leading-relaxed pl-10 md:pl-12">{f.a}</p>
             </div>
           ))}
         </div>
       </div>
    </div>
  )
}
