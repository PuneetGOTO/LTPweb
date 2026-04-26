import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "./AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    redirect("/login")
  }

  const username = (session.user as any).username

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden relative">
      <AdminSidebar username={username} />

      <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 relative z-10 bg-background md:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background/95 to-background">
        {children}
      </main>
    </div>
  )
}
