"use client"

import { useState } from "react"
import { registerUser } from "@/server/actions/auth"
import Link from "next/link"
import { User, Lock, UserPlus, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirm = formData.get("confirmPassword") as string
    
    if (password !== confirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const res = await registerUser(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        router.push("/login")
      }
    } catch (err) {
      setError("Registration failed. Please try again.")
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
        <h1 className="text-3xl font-bold font-orbitron mb-2">JOIN LTP</h1>
        <p className="text-muted-foreground text-sm">Create your access credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 rounded bg-destructive/20 border border-destructive text-destructive text-sm text-center">{error}</div>}
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground ml-1">USERNAME</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="username" 
              type="text" 
              required
              minLength={3}
              className="w-full bg-input/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-lg py-3 pl-10 pr-4 text-white" 
              placeholder="Select a username"
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
              minLength={6}
              className="w-full bg-input/40 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all rounded-lg py-3 pl-10 pr-4 text-white" 
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground ml-1">CONFIRM PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              name="confirmPassword" 
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
          className="w-full py-3 bg-accent text-white font-bold rounded-lg mt-6 hover:bg-accent/90 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,0,170,0.4)] disabled:opacity-50 transition-all active:scale-95"
        >
          {loading ? "INITIALIZING..." : "REGISTER"}
          {!loading && <UserPlus className="w-5 h-5" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-accent hover:underline font-semibold">Login here</Link>
      </div>
    </motion.div>
  )
}
