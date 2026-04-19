import prisma from "@/lib/prisma"
import VideoHubClient from "@/components/video-hub/VideoHubClient"

export default async function VideoHub() {
  const videos = await prisma.video.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    include: { uploader: true } 
  })
  
  const formattedVideos = videos.map(v => ({
    ...v,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }))

  return <VideoHubClient initialVideos={formattedVideos} />
}
