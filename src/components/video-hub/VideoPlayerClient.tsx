"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { Eye, Clock, ArrowLeft } from "lucide-react"

export default function VideoPlayerClient({ video }: { video: any }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <Link href="/video-hub" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm tracking-widest font-semibold">
           <ArrowLeft className="w-4 h-4"/> {t('video.back')}
        </Link>
        
        <div className="aspect-video bg-[#050505] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.1)] border border-border relative">
          <video 
            controls 
            autoPlay 
            poster={video.thumbnailUrl}
            src={video.url}
            className="w-full h-full outline-none"
          />
        </div>
        
        <div className="mt-8 border-b border-border pb-8">
           <h1 className="text-3xl font-orbitron font-bold text-foreground mb-2">{video.title}</h1>
           <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mt-4">
             <span className="flex items-center gap-2 bg-secondary py-1 px-3 rounded text-primary border border-border">
                {t('video.uploader')}: <strong className="text-foreground">{video.uploader.username}</strong>
             </span>
             <span className="flex items-center gap-1"><Eye className="w-4 h-4"/> {video.viewsCount} {t('hub.views')}</span>
             <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(video.createdAt).toLocaleDateString()}</span>
           </div>
           
           {video.description && (
             <div className="mt-6 p-6 bg-secondary rounded-xl border border-border text-muted-foreground leading-relaxed text-sm">
               {video.description}
             </div>
           )}
        </div>
      </main>
    </div>
  )
}
