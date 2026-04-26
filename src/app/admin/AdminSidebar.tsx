"use client"

import { useState } from "react"
import Link from "next/link"
import { LogOut, ArrowLeft, Menu, X } from "lucide-react"
import LangToggle from "@/components/LangToggle"
import AdminNavClient from "./AdminNavClient"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function AdminSidebar({ username }: { username: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-background border-b border-border z-30">
        <Link href="/" className="text-xl font-black font-orbitron text-primary drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">
          LTP ADMIN
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)} className="text-foreground p-2">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-64 border-r border-border bg-background/95 md:bg-background/80 backdrop-blur-xl flex flex-col py-6 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:block px-8 mb-8">
          <Link href="/" className="text-2xl font-black font-orbitron text-primary drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">
            LTP ADMIN
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AdminNavClient />
        </div>
        
        <div className="mt-auto border-t border-border pt-4 px-4 flex flex-col gap-4 bg-background/50">
          <div className="flex justify-between items-center px-4">
             <ThemeToggle />
             <LangToggle className="bg-secondary opacity-80" />
          </div>
          <Link href="/" className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded text-sm transition-colors font-bold tracking-widest border border-border">
            <ArrowLeft className="w-4 h-4"/> BACK TO SITE
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-primary truncate max-w-[120px] font-bold tracking-wider">
              {username}
            </div>
            <a href="/api/auth/signout" className="text-muted-foreground hover:text-destructive transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
