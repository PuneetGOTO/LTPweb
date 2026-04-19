import prisma from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import DashboardClient from "./DashboardClient"

import { auth } from "@/auth"

export default async function AdminDashboard() {
  const session = await auth()
  const role = (session?.user as any)?.role || "USER"
  
  const globalSetting = await prisma.globalSetting.findUnique({ where: { id: "global" } })
  const hasSuperAdminPin = !!(globalSetting?.superAdminPin)

  const usersCount = await prisma.user.count()
  const videosCount = await prisma.video.count()
  const viewsCount = await prisma.video.aggregate({
    _sum: { viewsCount: true }
  })

  // Check Cloudinary connection
  let cloudinaryConnected = false
  try {
    const pingResult = await cloudinary.api.ping()
    if (pingResult.status === 'ok') {
      cloudinaryConnected = true
    }
  } catch (e) {
    console.error("Cloudinary connection ping failed:", e)
  }

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { profile: { select: { avatarUrl: true } } }
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
      cloudinaryConnected={cloudinaryConnected}
      userRole={role}
      hasSuperAdminPin={hasSuperAdminPin}
    />
  )
}
