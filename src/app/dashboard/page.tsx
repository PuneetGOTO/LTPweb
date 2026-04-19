import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await auth()
  if (!session || !session.user) redirect("/login")
  
  const userId = session.user.id!
  
  const clientOrders = await prisma.order.findMany({
    where: { clientId: userId },
    include: { companion: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const companionOrders = await prisma.order.findMany({
    where: { companionId: userId },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  })
  
  return <DashboardClient clientOrders={clientOrders} companionOrders={companionOrders} />
}
