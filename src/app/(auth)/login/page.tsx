"use client"

import { useState } from "react"
import { loginUser } from "@/server/actions/auth"
import Link from "next/link"
import { User, Lock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    // AuthError throws NEXT_REDIRECT, error return means it actually failed internally
    const formData = new FormData(e.currentTarget)
    try {
      const res = await loginUser(formData)
      if (res?.error) setError(res.error)
    } catch (err) {
      // NEXT_REDIRECT is handled automatically.
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-orbitron mb-2">ACCESS HUB</h1>
        <p className="text-muted-foreground text-sm">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 rounded bg-destructive/20 border border-destructive text-destructive text-sm text-center">{error}</div>}
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground ml-1">USERNAME</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="username" 
              type="text" 
              required
              className="w-full bg-input/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-lg py-3 pl-10 pr-4 text-white" 
              placeholder="e.g. shadow_player"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground ml-1">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="password" 
              type="password" 
              required
              className="w-full bg-input/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-lg py-3 pl-10 pr-4 text-white" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-primary text-black font-bold rounded-lg mt-6 hover:bg-primary/90 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(0,245,255,0.4)] disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? "AUTHENTICATING..." : "LOGIN"}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline font-semibold">Register here</Link>
      </div>
    </motion.div>
  )
}
