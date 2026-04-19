import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 text-2xl font-orbitron font-black text-primary drop-shadow-[0_0_15px_rgba(0,245,255,0.7)]">
        LTP
      </Link>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="z-10 w-full max-w-md px-6">
        {children}
      </div>
    </div>
  )
}
