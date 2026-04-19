import prisma from "@/lib/prisma"
import AdminOrdersClient from "./AdminOrdersClient"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const session = await auth()
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login")

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: true, companion: true }
  })
  
  // Format for client payload
  const formatted = orders.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    client: { username: o.client.username },
    companion: o.companion ? { username: o.companion.username } : null
  }))

  return <AdminOrdersClient orders={formatted} />
}
