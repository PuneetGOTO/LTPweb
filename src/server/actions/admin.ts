"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

async function verifyAdmin() {
  const session = await auth()
  if (!session || !session.user || !["ADMIN", "SUPER_ADMIN"].includes((session.user as any).role)) {
    throw new Error("Unauthorized access. Admin privileges required.")
  }
  return session
}

export async function adminCreateUser(formData: FormData) {
  const session = await verifyAdmin()
  const isSuper = (session.user as any).role === "SUPER_ADMIN"
  
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as any
  const hourlyRate = parseInt(formData.get("hourlyRate") as string) || 150

  if (!username || !password) return { error: "Username and password required" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return { error: "Username already taken." }

  const passwordHash = await bcrypt.hash(password, 10)

  let finalRole = role && Object.values(["USER", "COMPANION", "ADMIN", "SUPER_ADMIN"]).includes(role) ? role : "USER"
  if (["ADMIN", "SUPER_ADMIN"].includes(finalRole) && !isSuper) {
    return { error: "Only Super Admins can assign Admin privileges." }
  }

  const createdTarget = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: finalRole,
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
  const session = await verifyAdmin()
  const isSuper = (session.user as any).role === "SUPER_ADMIN"

  const id = formData.get("id") as string
  const role = formData.get("role") as any
  const hourlyRate = parseInt(formData.get("hourlyRate") as string)
  const password = formData.get("password") as string

  if (!id) return { error: "User ID required" }

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) return { error: "User not found" }
  
  // Preventing normal admins from modifying other admins (unless themselves if they just want to edit profile)
  if (["ADMIN", "SUPER_ADMIN"].includes(targetUser.role) && !isSuper && targetUser.id !== session.user!.id) {
    return { error: "Only Super Admins can modify other Admin accounts." }
  }

  let dataToUpdate: any = {}
  if (role) {
     if (["ADMIN", "SUPER_ADMIN"].includes(role) && !isSuper && targetUser.role !== role) {
       return { error: "Only Super Admins can grant Admin privileges." }
     }
     dataToUpdate.role = role
  }
  if (password) {
    if (password.length < 6) return { error: "Password must be at least 6 characters" }
    dataToUpdate.passwordHash = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({
    where: { id },
    data: dataToUpdate
  })

  const displayName = formData.get("displayName") as string
  const platforms = formData.get("platforms") as string

  // Update profile
  const profile = await prisma.profile.findUnique({ where: { userId: id } })
  const profileData: any = {}
  
  if (!isNaN(hourlyRate)) profileData.hourlyRate = hourlyRate
  if (displayName) profileData.displayName = displayName
  if (platforms) profileData.platforms = platforms
  
  if (Object.keys(profileData).length > 0) {
    if (profile) {
      await prisma.profile.update({
        where: { userId: id },
        data: profileData
      })
    } else {
      await prisma.profile.create({
         data: { 
           userId: id, 
           hourlyRate: isNaN(hourlyRate) ? 150 : hourlyRate, 
           isOnline: true,
           displayName,
           platforms: platforms || "PC"
         }
      })
    }
  }

  revalidatePath("/admin/users")
  revalidatePath("/companions")
  return { success: true }
}

export async function adminDeleteUser(id: string) {
  const session = await verifyAdmin()
  const isSuper = (session.user as any).role === "SUPER_ADMIN"

  const targetUser = await prisma.user.findUnique({ where: { id } })
  if (!targetUser) return { error: "User not found" }
  if (["ADMIN", "SUPER_ADMIN"].includes(targetUser.role) && !isSuper) {
    return { error: "Only Super Admins can delete Admin accounts." }
  }

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

export async function claimSuperAdmin(formData: FormData) {
  const session = await auth()
  // Any ADMIN can attempt to claim
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return { error: "Must be a regular Admin to claim or enter Super Admin PIN." }
  }
  
  const pin = formData.get("pin") as string
  if (!pin || pin.length < 4) return { error: "PIN must be at least 4 characters long." }

  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } })
  
  if (!settings || !settings.superAdminPin) {
    // Phase 1: Set the PIN for the first time
    const hashedPin = await bcrypt.hash(pin, 10)
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { superAdminPin: hashedPin },
      create: { id: "global", superAdminPin: hashedPin }
    })
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SUPER_ADMIN" }
    })
    
    return { success: true }
  } else {
    // Phase 2: Verify PIN
    const isValid = await bcrypt.compare(pin, settings.superAdminPin)
    if (!isValid) return { error: "Incorrect Super Admin PIN." }
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SUPER_ADMIN" }
    })
    
    return { success: true }
  }
}
