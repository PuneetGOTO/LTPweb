"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBlindOrder } from "@/server/actions/order"
import { ShoppingCart, MessageCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"

export default function CheckoutClient({ platform, serverName, serviceType, hourlyRate }: any) {
  const router = useRouter()
  const { t } = useLanguage()
  const [hours, setHours] = useState(1)
  const [wechatId, setWechatId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wechatId.trim()) {
      setError(t('checkout.wechat.required'))
      return
    }
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("platform", platform)
    formData.append("serverName", serverName)
    formData.append("serviceType", serviceType)
    formData.append("durationHours", hours.toString())
    formData.append("wechatId", wechatId.trim())

    try {
      const res = await createBlindOrder(formData)
      if (res?.error) setError(res.error)
      else setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-black/60 shadow-[0_0_30px_rgba(0,245,255,0.1)] border border-white/10 p-8 rounded-2xl backdrop-blur-xl max-w-lg mx-auto text-center"
      >
        <div className="mb-6">
          <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-black font-orbitron text-green-400 mb-2">{t('checkout.success.title')}</h1>
          <p className="text-muted-foreground text-lg">{t('checkout.success.desc')}</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 space-y-3 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('checkout.platform')}</span>
            <span className="text-white font-bold">{platform}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('checkout.server')}</span>
            <span className="text-accent font-bold">{serverName === "NONE" ? "N/A" : serverName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('checkout.service')}</span>
            <span className="text-green-400 font-bold">{serviceType}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('checkout.duration')}</span>
            <span className="text-white font-bold">{hours} hr(s)</span>
          </div>
          <div className="flex justify-between text-sm border-t border-white/10 pt-3">
            <span className="text-primary font-bold">{t('checkout.total')}</span>
            <span className="text-white font-black text-xl">${hourlyRate * hours}</span>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-yellow-400/90 text-sm font-bold flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {t('checkout.success.wechat.note')}
          </p>
        </div>

        <button 
          onClick={() => router.push("/dashboard")}
          className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-all"
        >
          {t('checkout.success.dashboard')}
        </button>
      </motion.div>
    )
  }

  return (
    <div className="w-full bg-black/60 shadow-[0_0_30px_rgba(0,245,255,0.1)] border border-white/10 p-8 rounded-2xl backdrop-blur-xl max-w-lg mx-auto text-left">
       <h1 className="text-3xl font-black font-orbitron text-primary mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
         <ShoppingCart className="w-8 h-8" /> {t('checkout.title')}
       </h1>

       <div className="space-y-4 mb-8">
         <div className="flex justify-between items-center text-sm">
           <span className="text-muted-foreground font-bold">{t('checkout.platform')}</span>
           <span className="text-white font-black">{platform}</span>
         </div>
         <div className="flex justify-between items-center text-sm">
           <span className="text-muted-foreground font-bold">{t('checkout.server')}</span>
           <span className="text-accent font-black">{serverName === "NONE" ? "N/A" : serverName}</span>
         </div>
         <div className="flex justify-between items-center text-sm">
           <span className="text-muted-foreground font-bold">{t('checkout.service')}</span>
           <span className="text-green-400 font-black">{serviceType}</span>
         </div>
         <div className="flex justify-between items-center text-sm pt-4 border-t border-white/10">
           <span className="text-muted-foreground font-bold">{t('checkout.rate')}</span>
           <span className="text-white font-black">${hourlyRate} / hr</span>
         </div>
       </div>

       <form onSubmit={handleSubmit} className="space-y-6">
         {error && <div className="p-3 bg-destructive/20 text-destructive text-sm font-bold rounded">{error}</div>}
         
         {/* WeChat ID Input */}
         <div>
           <label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
             <MessageCircle className="w-4 h-4 text-green-500" /> {t('checkout.wechat.label')}
           </label>
           <input 
             type="text"
             value={wechatId}
             onChange={(e) => setWechatId(e.target.value)}
             placeholder={t('checkout.wechat.placeholder')}
             className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg outline-none px-4 py-3 focus:border-green-500 text-white text-lg font-bold placeholder:text-white/20 placeholder:font-normal placeholder:text-sm"
             required
           />
           <p className="text-xs text-muted-foreground mt-1.5">{t('checkout.wechat.hint')}</p>
         </div>

         <div>
           <label className="text-sm font-bold text-muted-foreground">{t('checkout.duration')}</label>
           <input 
             type="number" 
             min={1} 
             max={24}
             value={hours}
             onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
             className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg outline-none px-4 py-3 focus:border-primary text-white text-lg font-bold"
           />
         </div>

         <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
           <span className="text-primary font-bold font-orbitron tracking-widest">{t('checkout.total')}</span>
           <span className="text-3xl font-black text-white">${hourlyRate * hours}</span>
         </div>

         <button 
           type="submit" 
           disabled={loading}
           className="w-full bg-primary text-black font-black font-orbitron tracking-widest py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
         >
           {loading ? t('checkout.processing') : t('checkout.confirm')}
         </button>
       </form>
    </div>
  )
}
