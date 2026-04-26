"use client"

import { useState } from "react"
import { updateServicePrice, seedServicePricing, toggleServiceActive } from "@/server/actions/pricing"
import { Settings, Save, Database, Power } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useRouter } from "next/navigation"

export default function AdminPricingClient({ pricings }: { pricings: any[] }) {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [rates, setRates] = useState<Record<string, number>>(
    pricings.reduce((acc, p) => ({ ...acc, [p.id]: p.hourlyRate }), {})
  )
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(
    pricings.reduce((acc, p) => ({ ...acc, [p.id]: p.isActive }), {})
  )

  const handleSave = async (id: string) => {
    setLoading(id)
    setError("")
    try {
      const res = await updateServicePrice(id, rates[id])
      if (res?.error) setError(res.error)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const handleToggle = async (id: string) => {
    const newVal = !activeStates[id]
    setActiveStates(prev => ({ ...prev, [id]: newVal }))
    setLoading(id + "-toggle")
    setError("")
    try {
      const res = await toggleServiceActive(id, newVal)
      if (res?.error) {
        setActiveStates(prev => ({ ...prev, [id]: !newVal }))
        setError(res.error)
      }
    } catch (e: any) {
      setActiveStates(prev => ({ ...prev, [id]: !newVal }))
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const handleSeed = async () => {
    setLoading("seed")
    setError("")
    try {
      const res = await seedServicePricing()
      if (res?.error) setError(res.error)
      else router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(null)
    }
  }

  const handleChange = (id: string, val: string) => {
    setRates(prev => ({ ...prev, [id]: parseInt(val) || 0 }))
  }

  return (
    <div>
       <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
         <h1 className="text-3xl font-bold font-orbitron text-primary flex items-center gap-3">
           <Settings className="w-8 h-8" /> {t('admin.pricing.title')}
         </h1>
       </div>

       {error && <div className="p-3 bg-destructive/20 text-destructive font-bold text-sm mb-6 rounded">{error}</div>}

       <div className="bg-card backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
         <table className="w-full text-left">
           <thead className="bg-secondary border-b border-border text-xs text-muted-foreground font-orbitron tracking-widest">
             <tr>
               <th className="p-4">{t('checkout.platform')}</th>
               <th className="p-4">{t('checkout.server')}</th>
               <th className="p-4">{t('checkout.service')}</th>
               <th className="p-4">{t('checkout.rate')}</th>
               <th className="p-4 text-center">{t('admin.pricing.status')}</th>
               <th className="p-4 text-center">{t('admin.table.actions')}</th>
             </tr>
           </thead>
           <tbody>
             {pricings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center bg-secondary">
                    <p className="text-muted-foreground font-bold mb-4">{t('admin.pricing.empty')}</p>
                    <button 
                      onClick={handleSeed}
                      disabled={loading === "seed"}
                      className="bg-primary text-black font-black font-orbitron tracking-widest px-6 py-2 rounded shadow-[0_0_15px_rgba(0,245,255,0.4)] hover:bg-primary/80 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                       <Database className="w-4 h-4" /> 
                       {loading === "seed" ? t('checkout.processing') : t('admin.pricing.init')}
                    </button>
                  </td>
                </tr>
             ) : (
                pricings.map(p => (
                  <tr key={p.id} className={`border-b border-border hover:bg-secondary transition-colors ${!activeStates[p.id] ? 'opacity-50' : ''}`}>
                    <td className="p-4 font-black text-foreground">{p.platform}</td>
                    <td className="p-4 font-bold text-foreground/70">{p.server === "NONE" ? "N/A" : p.server}</td>
                    <td className={`p-4 font-black ${p.serviceType === 'COMPANION' ? 'text-green-400' : 'text-purple-500'}`}>
                      {!activeStates[p.id] && <span className="line-through">{p.serviceType}</span>}
                      {activeStates[p.id] && p.serviceType}
                    </td>
                    <td className="p-4">
                      <input 
                        type="number" 
                        value={rates[p.id]} 
                        onChange={(e) => handleChange(p.id, e.target.value)}
                        className="bg-secondary border border-border rounded px-3 py-1 outline-none text-foreground font-bold w-24 focus:border-primary"
                        suppressHydrationWarning={true}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={loading === p.id + "-toggle"}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold tracking-widest transition-all ${
                          activeStates[p.id]
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-black'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-black'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {activeStates[p.id] ? t('admin.pricing.on') : t('admin.pricing.off')}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleSave(p.id)}
                        disabled={loading === p.id || rates[p.id] === p.hourlyRate}
                        className="bg-primary/20 text-primary border border-primary/50 px-3 py-1 font-bold tracking-widest text-xs rounded hover:bg-primary hover:text-black transition-all disabled:opacity-30 flex items-center gap-2 mx-auto disabled:cursor-not-allowed"
                      >
                         <Save className="w-3 h-3" /> {loading === p.id ? "SAVING..." : "SAVE"}
                      </button>
                    </td>
                  </tr>
                ))
             )}
           </tbody>
         </table>
       </div>
    </div>
  )
}
