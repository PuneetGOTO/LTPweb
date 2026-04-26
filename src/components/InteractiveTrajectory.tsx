"use client"

import * as THREE from "three"
import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Line, Stars, OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { PlayCircle, PauseCircle } from "lucide-react"

function Scene({ progress }: { progress: number }) {
  // Artemis II Figure-8 Free-Return Trajectory Approximation
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.2, 0, 0),     // Earth parking orbit
      new THREE.Vector3(-1.5, 1.5, 1),   // TLI (Trans Lunar Injection)
      new THREE.Vector3(1.5, 0.8, -1),   // Coasting
      new THREE.Vector3(3.4, 0, 0),      // Lunar Flyby (Behind Moon)
      new THREE.Vector3(3.2, -0.5, 0.5), // Return trajectory start
      new THREE.Vector3(1.0, -1.5, 1.5), // Coasting back
      new THREE.Vector3(-1.5, -1.0, -0.5), // Approaching Earth
    ], true) // Closed loop
  }, [])

  const points = useMemo(() => curve.getPoints(100), [curve])
  
  // The spacecraft mesh ref
  const shipRef = useRef<THREE.Mesh>(null)

  // Update spacecraft position based on slider progress
  useFrame(() => {
    if (shipRef.current) {
      // smooth interpolation could be added, but direct mapping is responsive
      const position = curve.getPoint(progress)
      shipRef.current.position.copy(position)
    }
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      
      {/* Interactive Controls */}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />

      {/* Deep Space Stars */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      {/* Earth */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.2} roughness={0.7} />
        <pointLight color="#38bdf8" intensity={2} distance={5} />
      </mesh>

      {/* Moon */}
      <mesh position={[3, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.9} />
      </mesh>

      {/* Trajectory Line */}
      <Line
        points={points}
        color="#00f5ff"
        lineWidth={2}
        dashed={true}
        dashSize={0.2}
        gapSize={0.1}
        opacity={0.3}
        transparent
      />

      {/* Spacecraft */}
      <mesh ref={shipRef}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#ff00aa" />
        <pointLight color="#ff00aa" intensity={5} distance={3} />
      </mesh>

      {/* Post Processing Glow */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
      </EffectComposer>
    </>
  )
}

export default function InteractiveTrajectory() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Auto-play logic
  useMemo(() => {
    if (!isPlaying) return
    let animationFrameId: number
    let lastTime = performance.now()
    
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time
      setProgress((p) => {
        const next = p + dt * 0.1 // 10 seconds for a full loop
        return next > 1 ? 0 : next
      })
      animationFrameId = requestAnimationFrame(animate)
    }
    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isPlaying])

  // Telemetry logic based on progress
  let phase = "PRE-LAUNCH"
  if (progress > 0.05 && progress < 0.25) phase = "TRANSLUNAR INJECTION (TLI)"
  else if (progress >= 0.25 && progress < 0.45) phase = "OUTBOUND COAST"
  else if (progress >= 0.45 && progress < 0.6) phase = "LUNAR FLYBY"
  else if (progress >= 0.6 && progress < 0.85) phase = "RETURN COAST"
  else if (progress >= 0.85 && progress < 0.95) phase = "EARTH APPROACH"
  else if (progress >= 0.95) phase = "RE-ENTRY"

  return (
    <div className="absolute inset-0 w-full h-full group">
      
      <Canvas camera={{ position: [0, 3, 8], fov: 50 }}>
        <Scene progress={progress} />
      </Canvas>

      {/* Telemetry Display */}
      <div className="absolute top-6 right-6 text-right pointer-events-none font-orbitron text-xs flex flex-col gap-1">
        <div className="text-white/50">MISSION TIME: <span className="text-white">T+{(progress * 100).toFixed(1)}%</span></div>
        <div className="text-white/50">PHASE: <span className="text-accent">{phase}</span></div>
        <div className="text-white/50 mt-2">SYS STATUS: <span className="text-green-400">NOMINAL</span></div>
      </div>

      {/* Interactive Controls Panel */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-white hover:text-primary transition-colors"
        >
          {isPlaying ? <PauseCircle className="w-8 h-8 md:w-10 md:h-10" /> : <PlayCircle className="w-8 h-8 md:w-10 md:h-10" />}
        </button>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="hidden md:flex justify-between text-[10px] text-white/50 font-bold tracking-widest font-orbitron">
            <span>EARTH</span>
            <span className="text-accent">MOON</span>
            <span>EARTH</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.001" 
            value={progress}
            onChange={(e) => {
              setIsPlaying(false)
              setProgress(parseFloat(e.target.value))
            }}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-accent transition-colors"
          />
        </div>
      </div>
    </div>
  )
}
