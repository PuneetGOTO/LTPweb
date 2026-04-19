import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, ArrowLeft } from "lucide-react"
import LangToggle from "@/components/LangToggle"
import AdminNavClient from "./AdminNavClient"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      <aside className="w-64 border-r border-white/10 bg-black/80 backdrop-blur-xl flex flex-col py-6 relative z-20">
        <div className="px-8 mb-8">
          <Link href="/" className="text-2xl font-black font-orbitron text-primary drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">
            LTP ADMIN
          </Link>
        </div>
        
        <AdminNavClient />
        
        <div className="mt-auto border-t border-white/10 pt-4 px-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded text-sm transition-colors font-bold tracking-widest border border-white/10">
              <ArrowLeft className="w-4 h-4"/> BACK TO SITE
            </Link>
            <LangToggle className="justify-center w-full bg-white/5 opacity-80" />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-secondary truncate max-w-[120px] font-bold tracking-wider">
                {(session.user as any).username}
              </div>
              <a href="/api/auth/signout" className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </a>
            </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full p-8 relative z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-black via-slate-950 to-black">
        {children}
      </main>
    </div>
  )
}
