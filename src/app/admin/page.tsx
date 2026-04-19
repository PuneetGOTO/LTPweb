import prisma from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export default async function AdminDashboard() {
  const usersCount = await prisma.user.count()
  const videosCount = await prisma.video.count()
  const viewsCount = await prisma.video.aggregate({
    _sum: { viewsCount: true }
  })

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { username: true } },
      companion: { select: { username: true } }
    }
  })

  return (
    <DashboardClient 
      usersCount={usersCount}
      videosCount={videosCount}
      viewsCount={viewsCount._sum.viewsCount || 0}
      recentUsers={recentUsers}
      recentOrders={recentOrders}
    />
  )
}
