"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

async function verifyAdmin() {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized access. Admin privileges required.")
  }
}

export async function adminCreateUser(formData: FormData) {
  await verifyAdmin()
  
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as any
  const hourlyRate = parseInt(formData.get("hourlyRate") as string) || 150

  if (!username || !password) return { error: "Username and password required" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return { error: "Username already taken." }

  const passwordHash = await bcrypt.hash(password, 10)

  const createdTarget = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: role && Object.values(["USER", "COMPANION", "ADMIN"]).includes(role) ? role : "USER",
    }
  })

  // Set up profile and rates
  if (role === "COMPANION" || role === "ADMIN") {
    await prisma.profile.create({
      data: {
        userId: createdTarget.id,
        hourlyRate,
        isOnline: true,
        rating: 5.0,
        games: "Valorant"
      }
    })
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function adminUpdateUser(formData: FormData) {
  await verifyAdmin()

  const id = formData.get("id") as string
  const role = formData.get("role") as any
  const hourlyRate = parseInt(formData.get("hourlyRate") as string)
  const password = formData.get("password") as string

  if (!id) return { error: "User ID required" }

  let dataToUpdate: any = {}
  if (role) dataToUpdate.role = role
  if (password) {
    if (password.length < 6) return { error: "Password must be at least 6 characters" }
    dataToUpdate.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data: dataToUpdate
  })

  // Update profile for companions if hourlyRate provided
  if (!isNaN(hourlyRate)) {
    const profile = await prisma.profile.findUnique({ where: { userId: id } })
    if (profile) {
      await prisma.profile.update({
        where: { userId: id },
        data: { hourlyRate }
      })
    } else {
      await prisma.profile.create({
         data: { userId: id, hourlyRate, isOnline: true }
      })
    }
  }

  revalidatePath("/admin/users")
  revalidatePath("/companions")
  return { success: true }
}

export async function adminDeleteUser(id: string) {
  await verifyAdmin()

  try {
    // Delete cascading should handle Profile, Videos, Orders automatically per schema
    // Though for orders, normally we wouldn't delete a user but archive them. For MVP we permit it.
    await prisma.user.delete({ where: { id } })
    revalidatePath("/admin/users")
    revalidatePath("/companions")
    return { success: true }
  } catch(e: any) {
    return { error: "Could not delete user. They might be linked to strict relation data." }
  }
}
