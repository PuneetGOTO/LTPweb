"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"
import Link from "next/link"
import { Eye, Clock } from "lucide-react"

export default function VideoHubClient({ initialVideos }: { initialVideos: any[] }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col pt-0">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 pt-12">
        <h1 className="text-4xl font-black font-orbitron text-primary drop-shadow-[0_0_10px_rgba(0,245,255,0.4)] mb-2">
          {t('hub.title')}
        </h1>
        <p className="text-muted-foreground mb-12">{t('hub.subtitle')}</p>

        {initialVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-24 bg-secondary rounded-2xl border border-border">
            <p className="text-xl text-muted-foreground font-semibold">{t('hub.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialVideos.map(video => (
              <div key={video.id} className="group bg-background/40 backdrop-blur-md border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(0,245,255,0.2)]">
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {video.thumbnailUrl ? (
                     <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-gradient-to-br from-background to-secondary shadow-inner">
                       <span className="font-orbitron tracking-widest text-lg font-bold">LTP</span>
                     </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <Link href={`/video/${video.id}`} className="w-full py-2 bg-primary text-black font-bold text-center rounded text-sm tracking-widest shadow-[0_0_15px_rgba(0,245,255,0.5)]">
                       {t('hub.watch')}
                     </Link>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg leading-tight mb-2 truncate" title={video.title}>{video.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 border border-border rounded text-muted-foreground bg-secondary truncate max-w-[120px]">
                      {video.uploader?.username}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3"/> {video.viewsCount} {t('hub.views')}</span>
                    <span className="flex items-center gap-1 text-primary/80"><Clock className="w-3 h-3"/> {new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
