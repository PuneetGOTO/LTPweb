"use client"

import * as THREE from "three"
import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Line, Stars } from "@react-three/drei"

function Scene() {
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

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      
      {/* Deep Space Stars */}
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      {/* Earth */}
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.2} roughness={0.7} />
        {/* Atmosphere glow */}
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
      <Spacecraft curve={curve} />
    </>
  )
}

function Spacecraft({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    // One full loop every 1.5 seconds (matching the transition duration)
    const t = (clock.elapsedTime / 1.5) % 1
    const position = curve.getPoint(t)
    if (ref.current) {
      ref.current.position.copy(position)
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#ff00aa" />
      <pointLight color="#ff00aa" intensity={5} distance={3} />
    </mesh>
  )
}

export default function Trajectory3D() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas camera={{ position: [0, -2, 7], fov: 60 }}>
        <Scene />
      </Canvas>
    </div>
  )
}
