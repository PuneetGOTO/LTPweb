"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isPresent, setIsPresent] = useState(true)

  // A stylized figure-8 path resembling the Artemis II free-return trajectory
  const artemisPath = "M 200,500 C 200,200 800,200 800,500 C 800,800 200,800 200,500 Z"
  
  return (
    <>
      {/* 
        This is the Enter/Exit Overlay.
        When the route changes, the template re-mounts.
        We can use a simple motion.div that covers the screen, draws the trajectory, then fades out.
      */}
      <motion.div
        key={pathname + "-overlay"}
        initial={{ opacity: 1, pointerEvents: "auto" }}
        animate={{ opacity: 0, transitionEnd: { display: "none", pointerEvents: "none" } }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <div className="relative w-full h-full max-w-4xl max-h-screen flex items-center justify-center">
          {/* Earth & Moon Visuals */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute left-[15%] w-32 h-32 rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b82f6,#1e3a8a)] shadow-[0_0_60px_rgba(59,130,246,0.4)]" 
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute right-[15%] w-16 h-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,#d1d5db,#4b5563)] shadow-[0_0_30px_rgba(255,255,255,0.1)]" 
          />

          <svg viewBox="0 0 1000 1000" className="w-full h-full absolute inset-0">
            {/* The Trajectory Path */}
            <motion.path
              d="M 250,500 C 250,100 850,300 850,500 C 850,700 250,900 250,500"
              fill="transparent"
              strokeWidth="4"
              stroke="rgba(0, 245, 255, 0.5)"
              strokeDasharray="10 10"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {/* The Spacecraft glowing dot */}
            <motion.circle
              r="8"
              fill="#ff00aa"
              filter="drop-shadow(0 0 10px #ff00aa)"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{ offsetDistance: "100%", opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{ offsetPath: `path("M 250,500 C 250,100 850,300 850,500 C 850,700 250,900 250,500")` } as any}
            />
          </svg>

          {/* Telemetry Data text overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-10 left-10 font-orbitron text-primary text-xs tracking-widest flex flex-col gap-1"
          >
            <span>MISSION: ARTEMIS II SIMULATION</span>
            <span>TRAJECTORY: FREE-RETURN</span>
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
