"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function getServicePrice(platform: string, server: string | null, serviceType: string) {
  const safeServer = server || "NONE"
  let pricing = await prisma.servicePricing.findUnique({
    where: { 
      platform_server_serviceType: { 
        platform, 
        server: safeServer, 
        serviceType 
      } 
    }
  })

  // If not found, create a default pricing
  if (!pricing) {
    pricing = await prisma.servicePricing.create({
      data: {
        platform,
        server: safeServer,
        serviceType,
        hourlyRate: 150
      }
    })
  }

  return pricing
}

export async function updateServicePrice(id: string, hourlyRate: number, isActive?: boolean) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  const data: any = { hourlyRate }
  if (typeof isActive === "boolean") {
    data.isActive = isActive
  }

  await prisma.servicePricing.update({
    where: { id },
    data
  })

  return { success: true }
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  await prisma.servicePricing.update({
    where: { id },
    data: { isActive }
  })

  return { success: true }
}

export async function getAllServicePricing() {
  return await prisma.servicePricing.findMany({
    orderBy: [
      { platform: 'desc' },
      { server: 'asc' },
      { serviceType: 'asc' }
    ]
  })
}

export async function seedServicePricing() {
  const session = await auth()
  if (!session || !session.user || (session.user as any).role !== "ADMIN") return { error: "Unauthorized" }

  const combos = [
    { platform: "MOBILE", server: "NONE", serviceType: "COMPANION" },
    { platform: "MOBILE", server: "NONE", serviceType: "BOOSTING" },
    { platform: "PC", server: "HK", serviceType: "COMPANION" },
    { platform: "PC", server: "HK", serviceType: "BOOSTING" },
    { platform: "PC", server: "CN", serviceType: "COMPANION" },
    { platform: "PC", server: "CN", serviceType: "BOOSTING" }
  ]

  for (const c of combos) {
    await prisma.servicePricing.upsert({
      where: { platform_server_serviceType: c },
      update: {},
      create: { ...c, hourlyRate: 150, isActive: true }
    })
  }
  
  return { success: true }
}
