import prisma from "@/lib/prisma"
import HomeClient from "@/components/HomeClient"

// Revalidate every 60 seconds or force dynamic
export const revalidate = 60;

export default async function HomePage() {
  const companions = await prisma.user.findMany({
    where: { role: 'COMPANION' },
    include: { profile: true },
    take: 6,
    orderBy: { createdAt: 'desc' }
  })
  
  // Clean dates
  const formatted = companions.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return <HomeClient topCompanions={formatted} />
}
