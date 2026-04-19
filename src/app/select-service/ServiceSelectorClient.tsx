"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, MonitorPlay, Swords, Crosshair, Server, ArrowRight, ChevronLeft, Ban } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

type Platform = "MOBILE" | "PC" | null
type ServerOption = "HK" | "CN" | null
type ServiceType = "COMPANION" | "BOOSTING" | null

interface Props {
  serviceAvailability: Record<string, boolean>
}

export default function ServiceSelectorClient({ serviceAvailability }: Props) {
  const router = useRouter()
  const { t } = useLanguage()
  
  const [platform, setPlatform] = useState<Platform>(null)
  const [serverOption, setServerOption] = useState<ServerOption>(null)
  const [serviceType, setServiceType] = useState<ServiceType>(null)

  // Check if a specific service combo is active
  const isServiceActive = (p: string, s: string, st: string): boolean => {
    const key = `${p}_${s}_${st}`
    // Default to true if not found in map (hasn't been created yet)
    return serviceAvailability[key] !== false
  }

  const handleNext = () => {
    if (!platform) return
    if (platform === "PC" && !serverOption) return
    if (!serviceType) return

    const query = new URLSearchParams({
      platform,
      serverName: serverOption || "NONE",
      serviceType
    })
    
    router.push(`/checkout?${query.toString()}`)
  }

  const resetSelection = () => {
    setPlatform(null)
    setServerOption(null)
    setServiceType(null)
  }

  // Determine current server for availability check
  const currentServer = platform === "MOBILE" ? "NONE" : (serverOption || "NONE")

  return (
    <div className="min-h-screen bg-black flex flex-col relative w-full overflow-hidden">
       <Navbar />
       
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 pt-12 md:pt-24 flex flex-col items-center relative z-10">
         
         <AnimatePresence mode="wait">
            {/* Step 1: Platform Selection */}
            {!platform && (
              <motion.div 
                key="step-platform"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-4 text-center">{t('select.platform.title')}</h1>
                <p className="text-muted-foreground mb-12 text-center">{t('select.platform.sub')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                  <button 
                    onClick={() => setPlatform("MOBILE")}
                    className="group flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-12 hover:border-primary/50 hover:bg-primary/5 transition-all text-center min-h-[300px]"
                  >
                     <Smartphone className="w-20 h-20 text-white/50 group-hover:text-primary transition-colors mb-6" />
                     <h2 className="text-3xl font-black font-orbitron text-white">{t('select.mobile.title')}</h2>
                     <p className="text-muted-foreground mt-2">{t('select.mobile.sub')}</p>
                  </button>

                  <button 
                    onClick={() => setPlatform("PC")}
                    className="group flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-12 hover:border-accent/50 hover:bg-accent/5 transition-all text-center min-h-[300px]"
                  >
                     <MonitorPlay className="w-20 h-20 text-white/50 group-hover:text-accent transition-colors mb-6" />
                     <h2 className="text-3xl font-black font-orbitron text-white">{t('select.pc.title')}</h2>
                     <p className="text-muted-foreground mt-2">{t('select.pc.sub')}</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Server Selection (PC only) */}
            {platform === "PC" && !serverOption && (
              <motion.div 
                key="step-server"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="w-full flex flex-col items-center"
              >
                <button onClick={resetSelection} className="absolute top-0 left-0 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5"/> {t('select.btn.back')}
                </button>
                <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-4 text-center">{t('select.server.title')}</h1>
                <p className="text-muted-foreground mb-12 text-center">{t('select.server.sub')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                  <button 
                    onClick={() => setServerOption("HK")}
                    className="group flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-12 hover:border-accent/50 hover:bg-accent/5 transition-all text-center min-h-[250px]"
                  >
                     <Server className="w-16 h-16 text-white/50 group-hover:text-accent transition-colors mb-6" />
                     <h2 className="text-3xl font-black font-orbitron text-white">{t('select.hk.title')}</h2>
                     <p className="text-muted-foreground mt-2">{t('select.hk.sub')}</p>
                  </button>

                  <button 
                    onClick={() => setServerOption("CN")}
                    className="group flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-12 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-center min-h-[250px]"
                  >
                     <Server className="w-16 h-16 text-white/50 group-hover:text-red-500 transition-colors mb-6" />
                     <h2 className="text-3xl font-black font-orbitron text-white">{t('select.cn.title')}</h2>
                     <p className="text-muted-foreground mt-2">{t('select.cn.sub')}</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Service Type Selection */}
            {platform && (platform === "MOBILE" || serverOption) && !serviceType && (
              <motion.div 
                key="step-service"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="w-full flex flex-col items-center"
              >
                <button 
                  onClick={() => platform === "MOBILE" ? resetSelection() : setServerOption(null)} 
                  className="absolute top-0 left-0 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5"/> {t('select.btn.back')}
                </button>
                <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-4 text-center">{t('select.service.title')}</h1>
                <p className="text-muted-foreground mb-12 text-center">{t('select.service.sub')}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                  {/* COMPANION button */}
                  {(() => {
                    const companionActive = isServiceActive(platform!, currentServer, "COMPANION")
                    return (
                      <button 
                        onClick={() => companionActive && setServiceType("COMPANION")}
                        disabled={!companionActive}
                        className={`group relative flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border rounded-2xl p-12 transition-all text-center min-h-[250px] ${
                          companionActive 
                            ? 'border-white/10 hover:border-green-400/50 hover:bg-green-400/5 cursor-pointer' 
                            : 'border-white/5 cursor-not-allowed opacity-40'
                        }`}
                      >
                         {/* Diagonal strikethrough line for disabled state */}
                         {!companionActive && (
                           <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                             <div className="absolute top-0 left-0 w-full h-full">
                               <svg className="w-full h-full" preserveAspectRatio="none">
                                 <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(239,68,68,0.6)" strokeWidth="3" />
                               </svg>
                             </div>
                           </div>
                         )}
                         <Swords className={`w-16 h-16 mb-6 transition-colors ${companionActive ? 'text-white/50 group-hover:text-green-400' : 'text-white/20'}`} />
                         <h2 className={`text-3xl font-black font-orbitron ${companionActive ? 'text-white' : 'text-white/30 line-through'}`}>{t('select.comp.title')}</h2>
                         <p className={`mt-2 ${companionActive ? 'text-muted-foreground' : 'text-white/20'}`}>{t('select.comp.sub')}</p>
                         {!companionActive && (
                           <div className="mt-4 flex items-center gap-2 text-red-400/80 text-sm font-bold">
                             <Ban className="w-4 h-4" /> {t('select.unavailable')}
                           </div>
                         )}
                      </button>
                    )
                  })()}

                  {/* BOOSTING button */}
                  {(() => {
                    const boostingActive = isServiceActive(platform!, currentServer, "BOOSTING")
                    return (
                      <button 
                        onClick={() => boostingActive && setServiceType("BOOSTING")}
                        disabled={!boostingActive}
                        className={`group relative flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border rounded-2xl p-12 transition-all text-center min-h-[250px] ${
                          boostingActive 
                            ? 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer' 
                            : 'border-white/5 cursor-not-allowed opacity-40'
                        }`}
                      >
                         {/* Diagonal strikethrough line for disabled state */}
                         {!boostingActive && (
                           <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                             <div className="absolute top-0 left-0 w-full h-full">
                               <svg className="w-full h-full" preserveAspectRatio="none">
                                 <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(239,68,68,0.6)" strokeWidth="3" />
                               </svg>
                             </div>
                           </div>
                         )}
                         <Crosshair className={`w-16 h-16 mb-6 transition-colors ${boostingActive ? 'text-white/50 group-hover:text-purple-500' : 'text-white/20'}`} />
                         <h2 className={`text-3xl font-black font-orbitron ${boostingActive ? 'text-white' : 'text-white/30 line-through'}`}>{t('select.boost.title')}</h2>
                         <p className={`mt-2 ${boostingActive ? 'text-muted-foreground' : 'text-white/20'}`}>{t('select.boost.sub')}</p>
                         {!boostingActive && (
                           <div className="mt-4 flex items-center gap-2 text-red-400/80 text-sm font-bold">
                             <Ban className="w-4 h-4" /> {t('select.unavailable')}
                           </div>
                         )}
                      </button>
                    )
                  })()}
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {platform && (platform === "MOBILE" || serverOption) && serviceType && (
              <motion.div 
                key="step-final"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center max-w-2xl bg-white/5 border border-white/20 p-8 rounded-2xl backdrop-blur-lg"
              >
                <button onClick={() => setServiceType(null)} className="self-start flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8">
                  <ChevronLeft className="w-5 h-5"/> {t('select.btn.redo')}
                </button>
                <div className="w-full text-center space-y-4 mb-10">
                  <h3 className="text-xl text-muted-foreground">{t('select.selections')}</h3>
                  <div className="flex flex-wrap justify-center gap-4 text-2xl font-black font-orbitron text-white">
                     <span className="text-primary">{platform}</span>
                     {serverOption && <><ArrowRight className="text-white/30" /><span className="text-accent">{serverOption}</span></>}
                     <><ArrowRight className="text-white/30" /><span className="text-green-400">{serviceType}</span></>
                  </div>
                </div>

                <button 
                  onClick={handleNext}
                  className="w-full py-4 text-xl font-bold bg-white text-black hover:bg-white/90 rounded-xl tracking-widest backdrop-blur-md transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                >
                  {t('select.btn.checkout')}
                </button>
              </motion.div>
            )}
         </AnimatePresence>

       </div>
    </div>
  )
}
