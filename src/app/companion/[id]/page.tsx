import prisma from "@/lib/prisma"
import CompanionClient from "@/components/CompanionClient"
import { notFound } from "next/navigation"

export default async function CompanionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const companion = await prisma.user.findUnique({
    where: { id, role: "COMPANION" },
    include: { 
      profile: true,
      videos: {
        where: { isPublic: true },
        take: 3,
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!companion) return notFound()

  const formatted = {
    ...companion,
    createdAt: companion.createdAt.toISOString(),
    updatedAt: companion.updatedAt.toISOString(),
    videos: companion.videos.map(v => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }))
  }

  return <CompanionClient companion={formatted} />
}
