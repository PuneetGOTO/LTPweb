import prisma from "@/lib/prisma"
import AdminUsersClient from "./AdminUsersClient"

export const dynamic = "force-dynamic"

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { profile: true }
  })
  
  // Format data for client
  const formattedUsers = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }))
  
  return <AdminUsersClient users={formattedUsers} />
}
