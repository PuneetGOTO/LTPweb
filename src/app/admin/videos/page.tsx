import prisma from "@/lib/prisma"
import VideoManagerClient from "./VideoManagerClient"

// Make this route completely dynamic to avoid caching stale data on updates
export const dynamic = "force-dynamic"

export default async function AdminVideos() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: { uploader: true }
  })
  
  return <VideoManagerClient initialVideos={videos} />
}
