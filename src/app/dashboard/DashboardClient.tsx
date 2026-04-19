"use client"
import { Navbar } from "@/components/Navbar"
import { useLanguage } from "@/contexts/LanguageContext"
import { MessageSquare } from "lucide-react"

export default function DashboardClient({ clientOrders, companionOrders }: { clientOrders: any[], companionOrders: any[] }) {
  const { t } = useLanguage()

  // Replace with real discord link when available
  const DISCORD_LINK = "https://discord.gg/LTP-ESPORTS"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-bold font-orbitron text-primary mb-8 border-b border-white/10 pb-4">{t('dash.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* My Bookings */}
           <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <h2 className="text-2xl font-bold font-orbitron mb-6 text-accent">{t('dash.bookings')}</h2>
             {clientOrders.length === 0 ? (
               <p className="text-muted-foreground">{t('dash.empty.b')}</p>
             ) : (
               <div className="space-y-4">
                 {clientOrders.map(order => (
                   <div key={order.id} className="bg-black/40 border border-white/5 p-4 rounded-lg flex flex-col relative overflow-hidden group hover:border-accent/30 transition-colors">
                     <div className="absolute left-0 top-0 w-1 h-full bg-accent"></div>
                     <div className="flex justify-between items-center w-full">
                       <div>
                         <p className="font-bold text-lg mb-1 text-white">{order.companion?.username || "LTP Platform Service"}</p>
                         <p className="text-xs text-muted-foreground">{order.gameName} • {order.durationHours} hr(s)</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-primary">${order.totalPrice}</p>
                         <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold text-white/70 ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                           {order.status === 'PENDING' ? t('order.status.pending') : t('order.status.accepted')}
                         </span>
                       </div>
                     </div>

                     {order.status === 'PENDING' && (
                       <a href={DISCORD_LINK} target="_blank" className="mt-4 w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors">
                         <MessageSquare className="w-4 h-4"/> 
                         {t('discord.pay')}
                       </a>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Companion Requests */}
           <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <h2 className="text-2xl font-bold font-orbitron mb-6 text-primary flex items-center gap-2">
               {t('dash.requests')}
               {companionOrders.length > 0 && <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded-full">{companionOrders.length}</span>}
             </h2>
             {companionOrders.length === 0 ? (
               <p className="text-muted-foreground">{t('dash.empty.r')}</p>
             ) : (
               <div className="space-y-4">
                 {companionOrders.map(order => (
                   <div key={order.id} className="bg-black/40 border border-white/5 p-4 rounded-lg flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors">
                     <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
                     <div className="flex justify-between items-center w-full">
                       <div>
                         <p className="font-bold text-lg mb-1 text-white">{order.client.username}</p>
                         <p className="text-xs text-muted-foreground">{order.gameName} • {order.durationHours} hr(s)</p>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-accent">${order.totalPrice}</p>
                         <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold text-white/70 ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                           {order.status === 'PENDING' ? t('order.status.pending') : t('order.status.accepted')}
                         </span>
                       </div>
                     </div>
                     {order.status === 'PENDING' && (
                       <div className="mt-4 w-full bg-yellow-500/10 text-yellow-500/70 py-1 text-center rounded text-xs border border-yellow-500/20">
                          Awaiting Discord Payment from Client
                       </div>
                     )}
                     {order.status === 'ACCEPTED' && (
                       <div className="mt-4 w-full bg-green-500/10 text-green-400 py-1 text-center rounded text-xs border border-green-500/20 font-bold tracking-widest flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4"/> {t('discord.paid')}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
