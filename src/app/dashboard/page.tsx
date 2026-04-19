import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session || !session.user) redirect("/login")
  
  const userId = session.user.id!
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  })

  const clientOrders = await prisma.order.findMany({
    where: { clientId: userId },
    include: { companion: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' }
  })
  
  const companionOrders = await prisma.order.findMany({
    where: { companionId: userId },
    include: { client: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' }
  })
  
  return (
    <DashboardClient 
      clientOrders={clientOrders} 
      companionOrders={companionOrders}
      username={user?.profile?.displayName || (session.user as any).username}
      avatarUrl={user?.profile?.avatarUrl || null}
    />
  )
}
