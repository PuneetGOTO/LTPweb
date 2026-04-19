"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import cloudinary from "@/lib/cloudinary"
import { revalidatePath } from "next/cache"

export async function uploadAvatar(formData: FormData) {
  const session = await auth()
  if (!session || !session.user) return { error: "Not authenticated" }

  const file = formData.get("avatar") as File
  if (!file || file.size === 0) return { error: "No file provided" }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return { error: "Invalid file type. Please upload JPG, PNG, WebP, or GIF." }
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File too large. Maximum size is 5MB." }
  }

  try {
    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "ltp-avatars",
      public_id: `avatar_${session.user.id}`,
      overwrite: true,
      eager: [
        { width: 256, height: 256, crop: "fill", gravity: "face" }
      ]
    })

    // Use the eager-transformed URL if available, otherwise use the original
    const avatarUrl = result.eager?.[0]?.secure_url || result.secure_url

    // Upsert profile with new avatar
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id! }
    })

    if (existingProfile) {
      await prisma.profile.update({
        where: { userId: session.user.id! },
        data: { avatarUrl }
      })
    } else {
      await prisma.profile.create({
        data: {
          userId: session.user.id!,
          avatarUrl
        }
      })
    }

    revalidatePath("/dashboard")
    revalidatePath("/companions")
    return { success: true, avatarUrl }
  } catch (e: any) {
    console.error("Avatar upload failed:", e?.message || e)
    return { error: e?.message || "Upload failed. Please try again." }
  }
}

export async function getUserProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  })
  return profile
}
