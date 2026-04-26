"use client"
import { useLanguage } from "@/contexts/LanguageContext"
import { Globe } from "lucide-react"

export default function LangToggle({ className = "" }: { className?: string }) {
  const { t, toggleLanguage } = useLanguage()
  
  return (
    <button 
      onClick={toggleLanguage}
      className={`flex items-center gap-2 text-sm font-semibold tracking-wide hover:text-primary transition-colors border border-border rounded-full px-3 py-1 ${className}`}
    >
      <Globe className="w-4 h-4" />
      {t('lang.toggle')}
    </button>
  )
}
