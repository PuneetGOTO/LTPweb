import prisma from "@/lib/prisma"
import VideoPlayerClient from "@/components/video-hub/VideoPlayerClient"
import { notFound } from "next/navigation"

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const video = await prisma.video.findUnique({
    where: { id },
    include: { uploader: true }
  })
  
  if (!video || !video.isPublic) return notFound()
  
  // Implicitly increment views for demo 
  await prisma.video.update({
    where: { id },
    data: { viewsCount: { increment: 1 } }
  })

  // Format to safely cross NextJS Client Boundary
  const formattedVideo = {
    ...video,
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
  }

  return <VideoPlayerClient video={formattedVideo} />
}
