import prisma from "@/lib/prisma"
import CompanionsClient from "./CompanionsClient"

export const dynamic = "force-dynamic"

export default async function CompanionsHub() {
  const companions = await prisma.user.findMany({
    where: { role: 'COMPANION' },
    include: { profile: true },
    orderBy: { createdAt: 'desc' }
  })
  
  return <CompanionsClient companions={companions} />
}
