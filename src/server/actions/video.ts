"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import cloudinary from "@/lib/cloudinary"

export async function createVideo(formData: FormData) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const externalUrl = formData.get("externalUrl") as string
  const file = formData.get("file") as File
  
  let url = externalUrl;
  let thumbnailUrl = "";

  if (file && file.size > 0) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const uploadRes: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "ltp_videos" }, 
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      url = uploadRes.secure_url;
      // Convert Cloudinary video url to image url for thumbnail
      thumbnailUrl = uploadRes.secure_url.replace(/\.[^/.]+$/, ".jpg").replace("/upload/", "/upload/w_1280,q_auto,f_auto/");
    } catch (e) {
      console.error(e)
      // fallback if Cloudinary fails (e.g. invalid keys during dev)
      if (!url) return { error: "Cloudinary upload failed. Check API Keys." }
    }
  }

  if (!url) return { error: "Video file or external URL is required" };

  await prisma.video.create({
    data: {
      title,
      description,
      url,
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070",
      isPublic: true,
      uploaderId: session.user.id!
    }
  })

  revalidatePath("/admin/videos")
  revalidatePath("/video-hub")
  return { success: true }
}

export async function deleteVideo(id: string) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.video.delete({ where: { id } })
  
  revalidatePath("/admin/videos")
  revalidatePath("/video-hub")
  return { success: true }
}

export async function updateVideo(formData: FormData) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const externalUrl = formData.get("externalUrl") as string

  if (!id) return { error: "Video ID is required" }

  const dataToUpdate: any = {}
  if (title) dataToUpdate.title = title
  if (description !== null) dataToUpdate.description = description
  if (externalUrl) dataToUpdate.url = externalUrl

  await prisma.video.update({
    where: { id },
    data: dataToUpdate
  })

  revalidatePath("/admin/videos")
  revalidatePath("/video-hub")
  return { success: true }
}
