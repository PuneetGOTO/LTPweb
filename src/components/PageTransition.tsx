"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Trajectory3D from "./Trajectory3D"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isPresent, setIsPresent] = useState(true)

  return (
    <>
      {/* 
        This is the Enter/Exit Overlay.
        When the route changes, the template re-mounts.
      */}
      <motion.div
        key={pathname + "-overlay"}
        initial={{ opacity: 1, pointerEvents: "auto" }}
        animate={{ opacity: 0, transitionEnd: { display: "none", pointerEvents: "none" } }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          
          {/* 3D Scene */}
          <Trajectory3D />

          {/* Telemetry Data text overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-10 left-10 font-orbitron text-primary text-xs tracking-widest flex flex-col gap-1 pointer-events-none z-10 drop-shadow-[0_0_5px_rgba(0,245,255,0.8)]"
          >
            <span>MISSION: ARTEMIS II SIMULATION</span>
            <span>TRAJECTORY: 3D FREE-RETURN</span>
            <span>STATUS: NOMINAL</span>
            <span>SYS: INITIALIZING ROUTE <span className="animate-pulse">_</span></span>
          </motion.div>
        </div>
      </motion.div>

      {/* The Actual Page Content */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        className="w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </>
  )
}
