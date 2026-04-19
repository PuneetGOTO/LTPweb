"use client"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Navbar } from "@/components/Navbar"
import { createOrder } from "@/server/actions/order"
import { Star, CheckCircle, Mic, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CompanionClient({ companion }: { companion: any }) {
  const { t } = useLanguage()
  const profile = companion.profile || {}
  
  const [duration, setDuration] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault()
     setLoading(true)
     setError("")
     setSuccess(false)
     
     const formData = new FormData()
     formData.append("companionId", companion.id)
     formData.append("durationHours", duration.toString())
     formData.append("gameName", profile.games?.split(",")[0] || "General")

     try {
       const res = await createOrder(formData)
       if (res?.error) setError(res.error)
       else setSuccess(true)
     } catch (err: any) {
       setError(err.message)
     } finally {
       setLoading(false)
     }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Link href="/companions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors mb-6 text-sm tracking-widest font-semibold">
           <ArrowLeft className="w-4 h-4"/> BACK
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
             <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl sticky top-24 shadow-[0_0_40px_rgba(255,0,170,0.15)]">
               <div className="aspect-square w-full relative">
                 {profile.avatarUrl ? (
                   <img src={profile.avatarUrl} alt={companion.username} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-black flex items-center justify-center shadow-inner">
                     <span className="font-orbitron tracking-widest font-bold text-white/20">LTP PLAYER</span>
                   </div>
                 )}
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/10 rounded px-2 py-1 text-xs font-bold text-white flex items-center gap-1">
                   <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {profile.rating?.toFixed(1) || "5.0"}
                 </div>
                 {profile.isOnline && (
                   <div className="absolute top-4 right-4 bg-green-500 text-black text-[10px] font-extrabold px-2 py-1 rounded animate-pulse">
                     {t('companion.online')}
                   </div>
                 )}
               </div>
               
               <div className="p-6">
                 <h1 className="text-3xl font-black font-orbitron text-white mb-2 truncate" title={companion.username}>{companion.username}</h1>
                 <p className="text-2xl font-bold text-accent mb-6">${profile.hourlyRate || 150} <span className="text-sm font-normal text-muted-foreground">{t('companion.rate')}</span></p>
                 
                 <div className="mb-6 flex flex-wrap gap-2">
                   {(profile.games || "Valorant").split(',').map((g: string) => (
                      <span key={g} className="text-[10px] px-2 py-1 bg-white/10 rounded-sm border border-white/5 text-gray-300 uppercase">{g.trim()}</span>
                   ))}
                 </div>
                 
                 <form onSubmit={handleBooking} className="border-t border-white/10 pt-6">
                   <h3 className="text-sm font-bold text-white mb-3 tracking-widest">{t('booking.modal.title')}</h3>
                   
                   <div className="flex justify-between items-center bg-black/50 border border-white/10 rounded p-1 mb-4">
                     <button type="button" onClick={() => setDuration(Math.max(1, duration-1))} className="px-4 py-2 hover:bg-white/10 rounded text-muted-foreground transition">-</button>
                     <span className="font-bold text-white">{duration} {t('booking.duration').split(" ")[0]}</span>
                     <button type="button" onClick={() => setDuration(Math.min(24, duration+1))} className="px-4 py-2 hover:bg-white/10 rounded text-muted-foreground transition">+</button>
                   </div>
                   
                   <div className="flex justify-between mb-6 text-sm">
                     <span className="text-muted-foreground">{t('booking.total')}</span>
                     <span className="font-bold text-white">${(profile.hourlyRate || 150) * duration}</span>
                   </div>
                   
                   {error && <div className="mb-4 text-xs text-destructive text-center font-bold bg-destructive/10 p-2 rounded border border-destructive/20">{error}</div>}
                   {success && <div className="mb-4 text-xs text-green-400 bg-green-400/10 p-2 rounded flex center gap-2 justify-center border border-green-400/20"><CheckCircle className="w-4 h-4"/> Order Status: PENDING CONFIRMATION</div>}
                   
                   <button type="submit" disabled={loading || success} className="w-full py-3 bg-accent text-white font-bold tracking-widest rounded transition-all hover:shadow-[0_0_20px_rgba(255,0,170,0.5)] active:scale-95 disabled:opacity-50">
                     {success ? "REQUEST SENT" : loading ? "PROCESSING..." : t('companion.book')}
                   </button>
                 </form>
               </div>
             </div>
          </div>
          
          {/* Right Column - Info & Videos */}
          <div className="md:col-span-2 space-y-8 text-white">
             {profile.bio && (
               <section className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                 <h2 className="text-xl font-orbitron font-bold mb-4 drop-shadow-[0_0_10px_rgba(0,245,255,0.3)] text-primary inline-block">ABOUT ME</h2>
                 <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">{profile.bio}</p>
               </section>
             )}
             
             {profile.voiceUrl && (
               <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-wrap items-center gap-6 border-l-4 border-l-accent">
                 <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                   <Mic className="w-6 h-6 text-accent" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-bold text-lg mb-1 tracking-wider">Voice Intro</h3>
                   <audio controls className="w-full max-w-sm outline-none rounded bg-black/50">
                     <source src={profile.voiceUrl} type="audio/mpeg" />
                   </audio>
                 </div>
               </section>
             )}

             {companion.videos?.length > 0 && (
               <section>
                 <h2 className="text-xl font-orbitron font-bold mb-4 drop-shadow-[0_0_10px_rgba(0,245,255,0.3)] border-b border-white/10 pb-2 flex items-center justify-between">
                   HIGHLIGHT REELS
                   <span className="text-xs font-sans font-normal text-muted-foreground bg-white/5 px-2 py-1 rounded">From Video Hub</span>
                 </h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {companion.videos.map((video: any) => (
                      <Link href={`/video/${video.id}`} key={video.id} className="group relative aspect-video bg-black/50 border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                        {video.thumbnailUrl ? (
                           <img src={video.thumbnailUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all group-hover:scale-105" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-white/20 font-bold tracking-widest shadow-inner relative z-10 font-orbitron">LTP DATA</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-full p-4 pointer-events-none">
                          <h4 className="font-bold text-sm truncate text-white">{video.title}</h4>
                        </div>
                      </Link>
                   ))}
                 </div>
               </section>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
